from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
import uuid

from .models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva, Lote,
    MovimientoLote, InspeccionCalidad, EvidenciaCalidad,
    Observacion, Alerta, EventoSistema, Session, Notificacion, ConfiguracionSistema
)
from .serializers import (
    UsuarioSerializer, LoginSerializer, ProveedorSerializer,
    VariedadTabacoSerializer, EtapaProductivaSerializer,
    LoteListSerializer, LoteDetailSerializer, MovimientoLoteSerializer,
    InspeccionCalidadSerializer, EvidenciaCalidadSerializer,
    ObservacionSerializer, AlertaSerializer, EventoSistemaSerializer,
    EstadisticasSerializer, TrazabilidadSerializer, SessionSerializer,
    NotificacionSerializer, ConfiguracionSistemaSerializer
)
from .permissions import IsAdminUser, IsSupervisorUser, IsOperarioUser, IsCalidadUser


class AuthViewSet(viewsets.GenericViewSet):
    """ViewSet para autenticación de usuarios"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login de usuario y generación de token"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Check 2FA
        if user.two_factor_enabled:
            code = request.data.get('code')
            if not code:
                # Send code
                code = user.generate_two_factor_code()
                # Send email (we'll just log for now, in production use send_mail)
                print(f"2FA code for {user.email}: {code}")
                if settings.EMAIL_HOST:
                    try:
                        send_mail(
                            'Código de verificación',
                            f'Tu código de verificación es: {code}',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False,
                        )
                    except Exception as e:
                        print(f"Error sending email: {e}")
                return Response({
                    'requires_2fa': True,
                    'message': 'Código de verificación enviado'
                }, status=status.HTTP_200_OK)

            # Verify code
            if not user.verify_two_factor_code(code):
                return Response({'detail': 'Código inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear o recuperar token
        token, created = Token.objects.get_or_create(user=user)

        # Create session record
        session_token = str(uuid.uuid4())
        Session.objects.create(
            usuario=user,
            dispositivo=request.META.get('HTTP_USER_AGENT', 'Unknown')[:50],
            navegador=request.META.get('HTTP_USER_AGENT', 'Unknown')[:100],
            ip=self.get_client_ip(request),
            es_actual=True,
            token=session_token
        )

        # Registrar evento de login
        EventoSistema.objects.create(
            tipo=EventoSistema.TipoEvento.LOGIN,
            usuario=user,
            descripcion=f"Usuario {user.username} inició sesión",
            ip_address=self.get_client_ip(request)
        )

        return Response({
            'token': token.key,
            'session_token': session_token,
            'user': UsuarioSerializer(user).data
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Logout de usuario y eliminación de token"""
        # Registrar evento de logout
        EventoSistema.objects.create(
            tipo=EventoSistema.TipoEvento.LOGOUT,
            usuario=request.user,
            descripcion=f"Usuario {request.user.username} cerró sesión",
            ip_address=self.get_client_ip(request)
        )

        # Update session
        session_token = request.data.get('session_token')
        if session_token:
            try:
                session = Session.objects.get(token=session_token)
                session.es_actual = False
                session.save()
            except Session.DoesNotExist:
                pass

        # Eliminar token
        request.user.auth_token.delete()
        return Response({'detail': 'Sesión cerrada exitosamente'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Obtener información del usuario autenticado"""
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_2fa(self, request):
        """Activar/desactivar 2FA"""
        enabled = request.data.get('enabled', False)
        request.user.two_factor_enabled = enabled
        request.user.save()

        if enabled:
            # Send initial code
            code = request.user.generate_two_factor_code()
            print(f"2FA code for {request.user.email}: {code}")

        return Response({
            'two_factor_enabled': request.user.two_factor_enabled
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_2fa_code(self, request):
        """Enviar código de 2FA"""
        if not request.user.two_factor_enabled:
            return Response({'detail': '2FA no está activado'}, status=status.HTTP_400_BAD_REQUEST)

        code = request.user.generate_two_factor_code()
        print(f"2FA code for {request.user.email}: {code}")
        if settings.EMAIL_HOST:
            try:
                send_mail(
                    'Código de verificación',
                    f'Tu código de verificación es: {code}',
                    settings.DEFAULT_FROM_EMAIL,
                    [request.user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")

        return Response({'detail': 'Código enviado'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def request_reset_password(self, request):
        """Solicitar código de recuperación de contraseña"""
        identifier = request.data.get('identifier')
        if not identifier:
            return Response({'detail': 'Se requiere un usuario o correo'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar usuario por username o email
        try:
            if '@' in identifier:
                user = Usuario.objects.get(email__iexact=identifier)
            else:
                user = Usuario.objects.get(username__iexact=identifier)
        except Usuario.DoesNotExist:
            # No revelamos si el usuario existe o no
            return Response({'detail': 'Si el usuario existe, se ha enviado un código a su correo'}, status=status.HTTP_200_OK)

        code = user.generate_reset_password_code()
        print(f"Password reset code for {user.email}: {code}")
        if settings.EMAIL_HOST:
            try:
                send_mail(
                    'Código de recuperación de contraseña',
                    f'Tu código para recuperar tu contraseña es: {code}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")

        return Response({'detail': 'Si el usuario existe, se ha enviado un código a su correo'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_reset_password_code(self, request):
        """Verificar código de recuperación"""
        identifier = request.data.get('identifier')
        code = request.data.get('code')

        if not identifier or not code:
            return Response({'detail': 'Se requieren identificador y código'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar usuario
        try:
            if '@' in identifier:
                user = Usuario.objects.get(email__iexact=identifier)
            else:
                user = Usuario.objects.get(username__iexact=identifier)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Código inválido'}, status=status.HTTP_400_BAD_REQUEST)

        if user.verify_reset_password_code(code):
            return Response({'valid': True}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Código inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        """Restablecer contraseña"""
        identifier = request.data.get('identifier')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not all([identifier, code, new_password]):
            return Response({'detail': 'Faltan campos requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar usuario
        try:
            if '@' in identifier:
                user = Usuario.objects.get(email__iexact=identifier)
            else:
                user = Usuario.objects.get(username__iexact=identifier)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Código inválido'}, status=status.HTTP_400_BAD_REQUEST)

        if user.verify_reset_password_code(code):
            user.reset_password(new_password)
            return Response({'detail': 'Contraseña actualizada exitosamente'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Código inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def get_client_ip(request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SessionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para sesiones de usuario"""
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminar una sesión"""
        try:
            session = self.get_object()
            session.es_actual = False
            session.save()
            return Response({'detail': 'Sesión terminada'})
        except Session.DoesNotExist:
            return Response({'detail': 'Sesión no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def terminate_other(self, request):
        """Terminar todas las sesiones excepto la actual"""
        session_token = request.data.get('session_token')
        sessions = self.get_queryset().exclude(token=session_token)
        sessions.update(es_actual=False)
        return Response({'detail': 'Sesiones terminadas'})


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Usuario"""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rol', 'departamento', 'estado', 'is_active']
    search_fields = ['username', 'nombres', 'apellidos', 'email']
    ordering_fields = ['fecha_creacion', 'nombres', 'apellidos']
    ordering = ['-fecha_creacion']
    
    def perform_create(self, serializer):
        """Registrar evento al crear usuario"""
        usuario = serializer.save()
        EventoSistema.objects.create(
            tipo=EventoSistema.TipoEvento.CREACION_USUARIO,
            usuario=self.request.user,
            descripcion=f"Usuario {usuario.username} creado por {self.request.user.username}",
            datos_adicionales={'usuario_id': usuario.id},
            ip_address=AuthViewSet.get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        """Registrar evento al actualizar usuario"""
        usuario = serializer.save()
        EventoSistema.objects.create(
            tipo=EventoSistema.TipoEvento.MODIFICACION_USUARIO,
            usuario=self.request.user,
            descripcion=f"Usuario {usuario.username} modificado por {self.request.user.username}",
            datos_adicionales={'usuario_id': usuario.id},
            ip_address=AuthViewSet.get_client_ip(self.request)
        )


class ProveedorViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Proveedor"""
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado']
    search_fields = ['nombre', 'rfc']
    ordering_fields = ['nombre', 'fecha_creacion']
    ordering = ['nombre']


class VariedadTabacoViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo VariedadTabaco"""
    queryset = VariedadTabaco.objects.all()
    serializer_class = VariedadTabacoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['activo']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre']
    ordering = ['nombre']


class EtapaProductivaViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo EtapaProductiva"""
    queryset = EtapaProductiva.objects.all()
    serializer_class = EtapaProductivaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['orden']
    ordering = ['orden']
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """Obtener solo etapas activas"""
        etapas = self.queryset.filter(activa=True)
        serializer = self.get_serializer(etapas, many=True)
        return Response(serializer.data)


class LoteViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Lote"""
    queryset = Lote.objects.select_related(
        'proveedor', 'variedad', 'etapa_actual', 'responsable_actual', 'creado_por'
    ).prefetch_related(
        'movimientos', 'inspecciones', 'observaciones', 'alertas'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'etapa_actual', 'proveedor', 'responsable_actual']
    search_fields = ['codigo', 'proveedor__nombre', 'origen']
    ordering_fields = ['fecha_ingreso', 'fecha_creacion', 'codigo']
    ordering = ['-fecha_creacion']
    
    def get_serializer_class(self):
        """Usar serializer diferente para list y detail"""
        if self.action == 'list':
            return LoteListSerializer
        return LoteDetailSerializer
    
    def perform_create(self, serializer):
        """Generar código de lote y registrar evento"""
        # Generar código único
        year = timezone.now().year
        ultimo_lote = Lote.objects.filter(
            codigo__startswith=f'LT-{year}-'
        ).order_by('-codigo').first()
        
        if ultimo_lote:
            ultimo_numero = int(ultimo_lote.codigo.split('-')[-1])
            nuevo_numero = ultimo_numero + 1
        else:
            nuevo_numero = 1
        
        codigo = f'LT-{year}-{nuevo_numero:03d}'
        
        # Obtener primera etapa
        primera_etapa = EtapaProductiva.objects.filter(activa=True).order_by('orden').first()
        
        # Crear lote
        lote = serializer.save(
            codigo=codigo,
            creado_por=self.request.user,
            etapa_actual=primera_etapa
        )
        
        # Registrar evento
        EventoSistema.objects.create(
            tipo=EventoSistema.TipoEvento.CREACION_LOTE,
            usuario=self.request.user,
            lote=lote,
            descripcion=f"Lote {lote.codigo} creado",
            datos_adicionales={'lote_id': lote.id, 'codigo': lote.codigo},
            ip_address=AuthViewSet.get_client_ip(self.request)
        )
        
        # Crear primer movimiento (Ingreso)
        if primera_etapa:
            MovimientoLote.objects.create(
                lote=lote,
                etapa_destino=primera_etapa,
                usuario=self.request.user,
                tipo_movimiento=MovimientoLote.TipoMovimiento.INICIO,
                observaciones="Ingreso inicial del lote"
            )
    
    @action(detail=True, methods=['post'])
    def mover_etapa(self, request, pk=None):
        """Mover lote a la siguiente etapa"""
        lote = self.get_object()
        etapa_destino_id = request.data.get('etapa_destino')
        observaciones = request.data.get('observaciones', '')
        cantidad_procesada = request.data.get('cantidad_procesada_kg')
        incidencias = request.data.get('incidencias', MovimientoLote.Incidencia.NINGUNA)
        motivo_retraso = request.data.get('motivo_retraso', MovimientoLote.MotivoRetraso.NINGUNO)
        tiempo_trabajo = request.data.get('tiempo_trabajo_minutos')
        tiempo_pausa = request.data.get('tiempo_pausa_minutos')
        
        try:
            etapa_destino = EtapaProductiva.objects.get(id=etapa_destino_id)
        except EtapaProductiva.DoesNotExist:
            return Response(
                {'error': 'Etapa destino no encontrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear movimiento
        movimiento = MovimientoLote.objects.create(
            lote=lote,
            etapa_origen=lote.etapa_actual,
            etapa_destino=etapa_destino,
            usuario=request.user,
            tipo_movimiento=MovimientoLote.TipoMovimiento.FINALIZACION,
            cantidad_procesada_kg=cantidad_procesada,
            tiempo_trabajo_minutos=tiempo_trabajo,
            tiempo_pausa_minutos=tiempo_pausa,
            incidencias=incidencias,
            motivo_retraso=motivo_retraso,
            observaciones=observaciones
        )
        
        # Actualizar lote
        lote.etapa_actual = etapa_destino
        if cantidad_procesada:
            lote.peso_actual_kg = cantidad_procesada
        lote.save()
        
        # Registrar evento
        EventoSistema.objects.create(
            tipo=EventoSistema.TipoEvento.MOVIMIENTO_ETAPA,
            usuario=request.user,
            lote=lote,
            descripcion=f"Lote {lote.codigo} movido a {etapa_destino.nombre}",
            datos_adicionales={
                'movimiento_id': movimiento.id,
                'etapa_destino': etapa_destino.nombre
            },
            ip_address=AuthViewSet.get_client_ip(request)
        )
        
        return Response(MovimientoLoteSerializer(movimiento).data)
    
    @action(detail=True, methods=['post'])
    def asignar_responsable(self, request, pk=None):
        """Asignar responsable a un lote"""
        lote = self.get_object()
        responsable_id = request.data.get('responsable_id')
        
        try:
            responsable = Usuario.objects.get(id=responsable_id)
        except Usuario.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lote.responsable_actual = responsable
        lote.save()
        
        # Crear movimiento de reasignación
        MovimientoLote.objects.create(
            lote=lote,
            etapa_destino=lote.etapa_actual,
            usuario=request.user,
            tipo_movimiento=MovimientoLote.TipoMovimiento.REASIGNACION,
            observaciones=f"Reasignado a {responsable.nombre_completo}"
        )
        
        return Response({'detail': 'Responsable asignado exitosamente'})
    
    @action(detail=True, methods=['get'])
    def trazabilidad(self, request, pk=None):
        """Obtener trazabilidad completa del lote"""
        lote = self.get_object()
        
        # Construir timeline
        timeline = []
        
        # Agregar movimientos
        for movimiento in lote.movimientos.all():
            timeline.append({
                'tipo': 'movimiento',
                'fecha': movimiento.fecha_hora,
                'titulo': f"{movimiento.get_tipo_movimiento_display()}",
                'descripcion': movimiento.observaciones,
                'usuario': movimiento.usuario.nombre_completo if movimiento.usuario else None,
                'etapa_origen': movimiento.etapa_origen.nombre if movimiento.etapa_origen else None,
                'etapa_destino': movimiento.etapa_destino.nombre if movimiento.etapa_destino else None,
                'datos': MovimientoLoteSerializer(movimiento).data
            })
        
        # Agregar inspecciones
        for inspeccion in lote.inspecciones.all():
            timeline.append({
                'tipo': 'inspeccion',
                'fecha': inspeccion.fecha_hora_inicio,
                'titulo': f"Inspección de Calidad - {inspeccion.get_estado_calidad_display()}",
                'descripcion': inspeccion.observaciones,
                'usuario': inspeccion.inspector.nombre_completo if inspeccion.inspector else None,
                'datos': InspeccionCalidadSerializer(inspeccion).data
            })
        
        # Agregar observaciones
        for observacion in lote.observaciones.all():
            timeline.append({
                'tipo': 'observacion',
                'fecha': observacion.fecha_hora,
                'titulo': f"Observación - {observacion.get_tipo_display()}",
                'descripcion': observacion.contenido,
                'usuario': observacion.usuario.nombre_completo if observacion.usuario else None,
                'datos': ObservacionSerializer(observacion).data
            })
        
        # Ordenar timeline por fecha
        timeline.sort(key=lambda x: x['fecha'], reverse=True)
        
        # Calcular tiempo total y tiempo por etapa
        movimientos_finalizacion = lote.movimientos.filter(
            tipo_movimiento=MovimientoLote.TipoMovimiento.FINALIZACION
        )
        tiempo_total_minutos = movimientos_finalizacion.aggregate(
            total=Sum('tiempo_trabajo_minutos')
        )['total'] or 0
        
        tiempo_por_etapa = {}
        for etapa in EtapaProductiva.objects.all():
            tiempo = movimientos_finalizacion.filter(etapa_origen=etapa).aggregate(
                total=Sum('tiempo_trabajo_minutos')
            )['total'] or 0
            tiempo_por_etapa[etapa.nombre] = tiempo
        
        data = {
            'lote': LoteDetailSerializer(lote).data,
            'timeline': timeline,
            'tiempo_total_minutos': tiempo_total_minutos,
            'tiempo_por_etapa': tiempo_por_etapa
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas generales"""
        lotes_activos = Lote.objects.filter(estado=Lote.Estado.EN_PRODUCCION).count()
        lotes_pendientes = Lote.objects.filter(estado=Lote.Estado.PENDIENTE).count()
        lotes_completados = Lote.objects.filter(estado=Lote.Estado.FINALIZADO).count()
        
        # Lotes retrasados (más de X horas en la misma etapa)
        hace_24_horas = timezone.now() - timedelta(hours=24)
        lotes_retrasados = Lote.objects.filter(
            estado=Lote.Estado.EN_PRODUCCION,
            fecha_actualizacion__lt=hace_24_horas
        ).count()
        
        # Inspecciones
        inspecciones_pendientes = InspeccionCalidad.objects.filter(
            estado_calidad=InspeccionCalidad.EstadoCalidad.PENDIENTE
        ).count()
        inspecciones_aprobadas = InspeccionCalidad.objects.filter(
            estado_calidad__in=[
                InspeccionCalidad.EstadoCalidad.APROBADO,
                InspeccionCalidad.EstadoCalidad.APROBADO_CON_OBSERVACIONES
            ]
        ).count()
        inspecciones_rechazadas = InspeccionCalidad.objects.filter(
            estado_calidad=InspeccionCalidad.EstadoCalidad.RECHAZADO
        ).count()
        
        # Alertas activas
        alertas_activas = Alerta.objects.filter(estado=Alerta.EstadoAlerta.ACTIVA).count()
        
        # Peso total
        peso_total = Lote.objects.aggregate(total=Sum('peso_actual_kg'))['total'] or 0
        
        data = {
            'lotes_activos': lotes_activos,
            'lotes_pendientes': lotes_pendientes,
            'lotes_completados': lotes_completados,
            'lotes_retrasados': lotes_retrasados,
            'lotes_en_calidad': inspecciones_pendientes,
            'inspecciones_pendientes': inspecciones_pendientes,
            'inspecciones_aprobadas': inspecciones_aprobadas,
            'inspecciones_rechazadas': inspecciones_rechazadas,
            'alertas_activas': alertas_activas,
            'peso_total_kg': peso_total
        }
        
        return Response(data)


class MovimientoLoteViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo MovimientoLote"""
    queryset = MovimientoLote.objects.select_related(
        'lote', 'etapa_origen', 'etapa_destino', 'usuario'
    )
    serializer_class = MovimientoLoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['lote', 'tipo_movimiento', 'etapa_destino']
    ordering_fields = ['fecha_hora']
    ordering = ['-fecha_hora']


class InspeccionCalidadViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo InspeccionCalidad"""
    queryset = InspeccionCalidad.objects.select_related(
        'lote', 'etapa', 'inspector'
    ).prefetch_related('evidencias')
    serializer_class = InspeccionCalidadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['lote', 'estado_calidad', 'grado_calidad', 'decision']
    ordering_fields = ['fecha_hora_inicio']
    ordering = ['-fecha_hora_inicio']
    
    def perform_create(self, serializer):
        """Registrar evento al crear inspección"""
        inspeccion = serializer.save(inspector=self.request.user)
        EventoSistema.objects.create(
            tipo=EventoSistema.TipoEvento.INSPECCION_CALIDAD,
            usuario=self.request.user,
            lote=inspeccion.lote,
            descripcion=f"Inspección de calidad creada para lote {inspeccion.lote.codigo}",
            datos_adicionales={
                'inspeccion_id': inspeccion.id,
                'estado': inspeccion.estado_calidad
            },
            ip_address=AuthViewSet.get_client_ip(self.request)
        )
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Obtener inspecciones pendientes"""
        inspecciones = self.queryset.filter(
            estado_calidad=InspeccionCalidad.EstadoCalidad.PENDIENTE
        )
        serializer = self.get_serializer(inspecciones, many=True)
        return Response(serializer.data)


class ObservacionViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Observacion"""
    queryset = Observacion.objects.select_related('lote', 'usuario')
    serializer_class = ObservacionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lote', 'tipo']
    search_fields = ['contenido']
    ordering_fields = ['fecha_hora']
    ordering = ['-fecha_hora']
    
    def perform_create(self, serializer):
        """Asignar usuario actual al crear observación"""
        serializer.save(usuario=self.request.user)


class AlertaViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Alerta"""
    queryset = Alerta.objects.select_related(
        'lote', 'etapa', 'resuelto_por'
    )
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo', 'severidad', 'estado', 'lote']
    ordering_fields = ['fecha_creacion', 'severidad']
    ordering = ['-fecha_creacion']
    
    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        """Resolver una alerta"""
        alerta = self.get_object()
        alerta.estado = Alerta.EstadoAlerta.RESUELTA
        alerta.fecha_resolucion = timezone.now()
        alerta.resuelto_por = request.user
        alerta.save()
        
        return Response({'detail': 'Alerta resuelta exitosamente'})
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """Obtener alertas activas"""
        alertas = self.queryset.filter(estado=Alerta.EstadoAlerta.ACTIVA)
        serializer = self.get_serializer(alertas, many=True)
        return Response(serializer.data)


class EventoSistemaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para el modelo EventoSistema (solo lectura)"""
    queryset = EventoSistema.objects.select_related('usuario', 'lote')
    serializer_class = EventoSistemaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo', 'usuario', 'lote']
    ordering_fields = ['fecha_hora']
    ordering = ['-fecha_hora']
    
    @action(detail=False, methods=['get'])
    def recientes(self, request):
        """Obtener eventos recientes (últimas 72 horas, máximo 100)"""
        hace_72_horas = timezone.now() - timedelta(hours=72)
        eventos = self.queryset.filter(fecha_hora__gte=hace_72_horas).order_by('-fecha_hora')[:100]
        serializer = self.get_serializer(eventos, many=True)
        return Response(serializer.data)



class NotificacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo Notificacion.
    Cada usuario solo puede ver sus propias notificaciones.
    """
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo', 'categoria', 'leida']
    ordering_fields = ['fecha_creacion']
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        return Notificacion.objects.filter(
            usuario=self.request.user
        ).select_related('usuario', 'lote')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['get'])
    def no_leidas(self, request):
        """Retorna sólo las notificaciones no leídas del usuario autenticado."""
        qs = self.get_queryset().filter(leida=False)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marca todas las notificaciones del usuario como leídas."""
        updated = self.get_queryset().filter(leida=False).update(leida=True)
        return Response({'detail': f'{updated} notificaciones marcadas como leídas.'})

    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marca una notificación individual como leída."""
        notif = self.get_object()
        notif.leida = True
        notif.save(update_fields=['leida'])
        return Response({'detail': 'Notificación marcada como leída.'})

    @action(detail=False, methods=['get'])
    def contador(self, request):
        """Devuelve el conteo de notificaciones no leídas."""
        count = self.get_queryset().filter(leida=False).count()
        return Response({'no_leidas': count})


class ConfiguracionSistemaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la configuración del sistema (clave-valor).
    Solo admins pueden modificar; el resto solo puede leer.
    """
    queryset = ConfiguracionSistema.objects.all()
    serializer_class = ConfiguracionSistemaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['clave', 'descripcion']
    ordering_fields = ['clave', 'fecha_actualizacion']
    ordering = ['clave']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            # Solo administradores pueden modificar la configuración
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def por_clave(self, request):
        """Obtiene una configuración por su clave. ?clave=mi_clave"""
        clave = request.query_params.get('clave')
        if not clave:
            return Response(
                {'detail': 'Se requiere el parámetro ?clave='},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            config = ConfiguracionSistema.objects.get(clave=clave)
            return Response(ConfiguracionSistemaSerializer(config).data)
        except ConfiguracionSistema.DoesNotExist:
            return Response(
                {'detail': f'Configuración "{clave}" no encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )
