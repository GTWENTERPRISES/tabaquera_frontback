from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva, Lote,
    MovimientoLote, InspeccionCalidad, EvidenciaCalidad,
    Observacion, Alerta, EventoSistema, Session
)


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Usuario"""
    nombre_completo = serializers.ReadOnlyField()
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    two_factor_enabled = serializers.BooleanField(required=False)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'nombres', 'apellidos', 'nombre_completo',
            'telefono', 'rol', 'departamento', 'estado', 'password',
            'is_active', 'fecha_creacion', 'fecha_actualizacion', 'two_factor_enabled'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Usuario.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class SessionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo de sesiones"""
    usuario_nombre = serializers.CharField(source='usuario.nombre_completo', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'usuario', 'usuario_nombre', 'dispositivo', 'navegador',
            'ip', 'ubicacion', 'es_actual', 'fecha_creacion', 'ultima_actividad'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'ultima_actividad']


class LoginSerializer(serializers.Serializer):
    """Serializer para login de usuarios"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Permitir login por email además de username
            if '@' in username:
                usuario = Usuario.objects.filter(email__iexact=username).first()
                if usuario:
                    username = usuario.username
            
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            if not user:
                raise serializers.ValidationError('Credenciales inválidas', code='authorization')
            if not user.is_active:
                raise serializers.ValidationError('Usuario inactivo', code='authorization')
        else:
            raise serializers.ValidationError('Debe incluir "username" y "password"', code='authorization')
        
        attrs['user'] = user
        return attrs


class ProveedorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Proveedor"""
    
    class Meta:
        model = Proveedor
        fields = [
            'id', 'nombre', 'rfc', 'direccion', 'telefono', 'email',
            'estado', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class VariedadTabacoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo VariedadTabaco"""
    
    class Meta:
        model = VariedadTabaco
        fields = ['id', 'nombre', 'descripcion', 'caracteristicas', 'activo']
        read_only_fields = ['id']


class EtapaProductivaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo EtapaProductiva"""
    
    class Meta:
        model = EtapaProductiva
        fields = [
            'id', 'nombre', 'orden', 'descripcion',
            'tiempo_esperado_horas', 'activa'
        ]
        read_only_fields = ['id']


class MovimientoLoteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo MovimientoLote"""
    usuario_nombre = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    etapa_origen_nombre = serializers.CharField(source='etapa_origen.nombre', read_only=True)
    etapa_destino_nombre = serializers.CharField(source='etapa_destino.nombre', read_only=True)
    
    class Meta:
        model = MovimientoLote
        fields = [
            'id', 'lote', 'etapa_origen', 'etapa_origen_nombre',
            'etapa_destino', 'etapa_destino_nombre', 'usuario', 'usuario_nombre',
            'tipo_movimiento', 'fecha_hora', 'cantidad_procesada_kg',
            'tiempo_trabajo_minutos', 'tiempo_pausa_minutos',
            'incidencias', 'motivo_retraso', 'observaciones'
        ]
        read_only_fields = ['id', 'fecha_hora']


class EvidenciaCalidadSerializer(serializers.ModelSerializer):
    """Serializer para el modelo EvidenciaCalidad"""
    
    class Meta:
        model = EvidenciaCalidad
        fields = ['id', 'inspeccion', 'tipo', 'archivo', 'descripcion', 'fecha_subida']
        read_only_fields = ['id', 'fecha_subida']


class InspeccionCalidadSerializer(serializers.ModelSerializer):
    """Serializer para el modelo InspeccionCalidad"""
    inspector_nombre = serializers.CharField(source='inspector.nombre_completo', read_only=True)
    etapa_nombre = serializers.CharField(source='etapa.nombre', read_only=True)
    evidencias = EvidenciaCalidadSerializer(many=True, read_only=True)
    
    class Meta:
        model = InspeccionCalidad
        fields = [
            'id', 'lote', 'etapa', 'etapa_nombre', 'inspector', 'inspector_nombre',
            'estado_calidad', 'grado_calidad', 'temperatura', 'humedad', 'peso_kg',
            'humedad_correcta', 'temperatura_correcta', 'peso_correcto',
            'embalaje_correcto', 'etiquetado_correcto', 'qr_legible', 'qr_verificado',
            'decision', 'motivo_rechazo', 'observaciones',
            'fecha_hora_inicio', 'fecha_hora_fin', 'duracion_minutos',
            'evidencias', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'duracion_minutos', 'fecha_creacion', 'fecha_actualizacion']


class ObservacionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Observacion"""
    usuario_nombre = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    
    class Meta:
        model = Observacion
        fields = [
            'id', 'lote', 'usuario', 'usuario_nombre',
            'tipo', 'contenido', 'fecha_hora'
        ]
        read_only_fields = ['id', 'fecha_hora']


class AlertaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Alerta"""
    lote_codigo = serializers.CharField(source='lote.codigo', read_only=True)
    etapa_nombre = serializers.CharField(source='etapa.nombre', read_only=True)
    resuelto_por_nombre = serializers.CharField(source='resuelto_por.nombre_completo', read_only=True)
    
    class Meta:
        model = Alerta
        fields = [
            'id', 'lote', 'lote_codigo', 'etapa', 'etapa_nombre',
            'tipo', 'severidad', 'estado', 'titulo', 'descripcion',
            'fecha_creacion', 'fecha_resolucion', 'resuelto_por', 'resuelto_por_nombre'
        ]
        read_only_fields = ['id', 'fecha_creacion']


class LoteListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listado de lotes"""
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    variedad_nombre = serializers.CharField(source='variedad.nombre', read_only=True)
    etapa_actual_nombre = serializers.CharField(source='etapa_actual.nombre', read_only=True)
    responsable_nombre = serializers.CharField(source='responsable_actual.nombre_completo', read_only=True)
    
    class Meta:
        model = Lote
        fields = [
            'id', 'codigo', 'codigo_qr', 'proveedor', 'proveedor_nombre',
            'variedad', 'variedad_nombre', 'origen', 'peso_inicial_kg', 'peso_actual_kg',
            'cantidad_bultos', 'estado', 'etapa_actual', 'etapa_actual_nombre',
            'responsable_actual', 'responsable_nombre', 'fecha_ingreso',
            'fecha_inicio_produccion', 'fecha_finalizacion', 'fecha_creacion'
        ]
        read_only_fields = ['id', 'codigo', 'codigo_qr', 'fecha_creacion']


class LoteDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para un lote con todas las relaciones"""
    proveedor = ProveedorSerializer(read_only=True)
    proveedor_id = serializers.PrimaryKeyRelatedField(
        queryset=Proveedor.objects.all(),
        source='proveedor',
        write_only=True
    )
    variedad = VariedadTabacoSerializer(read_only=True)
    variedad_id = serializers.PrimaryKeyRelatedField(
        queryset=VariedadTabaco.objects.all(),
        source='variedad',
        write_only=True
    )
    etapa_actual = EtapaProductivaSerializer(read_only=True)
    responsable_actual = UsuarioSerializer(read_only=True)
    creado_por = UsuarioSerializer(read_only=True)
    movimientos = MovimientoLoteSerializer(many=True, read_only=True)
    inspecciones = InspeccionCalidadSerializer(many=True, read_only=True)
    observaciones = ObservacionSerializer(many=True, read_only=True)
    alertas = AlertaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lote
        fields = [
            'id', 'codigo', 'codigo_qr', 'proveedor', 'proveedor_id',
            'variedad', 'variedad_id', 'origen', 'peso_inicial_kg', 'peso_actual_kg',
            'cantidad_bultos', 'estado', 'etapa_actual', 'responsable_actual',
            'fecha_ingreso', 'fecha_inicio_produccion', 'fecha_finalizacion',
            'observaciones_iniciales', 'creado_por', 'fecha_creacion', 'fecha_actualizacion',
            'movimientos', 'inspecciones', 'observaciones', 'alertas'
        ]
        read_only_fields = [
            'id', 'codigo', 'codigo_qr', 'creado_por',
            'fecha_creacion', 'fecha_actualizacion'
        ]


class EventoSistemaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo EventoSistema"""
    usuario_nombre = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    lote_codigo = serializers.CharField(source='lote.codigo', read_only=True)
    
    class Meta:
        model = EventoSistema
        fields = [
            'id', 'tipo', 'usuario', 'usuario_nombre', 'lote', 'lote_codigo',
            'descripcion', 'datos_adicionales', 'fecha_hora', 'ip_address'
        ]
        read_only_fields = ['id', 'fecha_hora']


class EstadisticasSerializer(serializers.Serializer):
    """Serializer para estadísticas del dashboard"""
    lotes_activos = serializers.IntegerField()
    lotes_pendientes = serializers.IntegerField()
    lotes_completados = serializers.IntegerField()
    lotes_retrasados = serializers.IntegerField()
    lotes_en_calidad = serializers.IntegerField()
    inspecciones_pendientes = serializers.IntegerField()
    inspecciones_aprobadas = serializers.IntegerField()
    inspecciones_rechazadas = serializers.IntegerField()
    alertas_activas = serializers.IntegerField()
    peso_total_kg = serializers.DecimalField(max_digits=10, decimal_places=2)


class TrazabilidadSerializer(serializers.Serializer):
    """Serializer para la trazabilidad completa de un lote"""
    lote = LoteDetailSerializer()
    timeline = serializers.ListField()
    tiempo_total_minutos = serializers.IntegerField()
    tiempo_por_etapa = serializers.DictField()
