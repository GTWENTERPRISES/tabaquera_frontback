from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.utils import timezone
import uuid
import random


class Usuario(AbstractUser):
    """
    Modelo de Usuario personalizado con roles y departamentos.
    Extiende AbstractUser para mantener la funcionalidad básica de Django.
    """

    class Rol(models.TextChoices):
        ADMINISTRADOR = 'administrador', 'Administrador'
        SUPERVISOR = 'supervisor', 'Supervisor'
        OPERARIO = 'operario', 'Operario'
        CONTROL_CALIDAD = 'control_calidad', 'Control de Calidad'

    class Departamento(models.TextChoices):
        PRODUCCION = 'produccion', 'Producción'
        CALIDAD = 'calidad', 'Calidad'
        RECEPCION = 'recepcion', 'Recepción'
        CLASIFICACION = 'clasificacion', 'Clasificación'
        SELECCION = 'seleccion', 'Selección'
        EMPAQUE = 'empaque', 'Empaque'
        DISTRIBUCION = 'distribucion', 'Distribución'
        ADMINISTRACION = 'administracion', 'Administración'

    class Estado(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        INACTIVO = 'inactivo', 'Inactivo'

    # Campos adicionales
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    telefono = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message='El teléfono debe tener exactamente 10 dígitos')]
    )
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.OPERARIO)
    departamento = models.CharField(max_length=20, choices=Departamento.choices)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.ACTIVO)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    # 2FA
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_code = models.CharField(max_length=6, blank=True, null=True)
    two_factor_code_expires = models.DateTimeField(blank=True, null=True)

    # Password Reset
    reset_password_code = models.CharField(max_length=6, blank=True, null=True)
    reset_password_code_expires = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'usuarios'
        ordering = ['-fecha_creacion']
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['rol']),
            models.Index(fields=['departamento']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f"{self.nombres} {self.apellidos} - {self.get_rol_display()}"

    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"

    def generate_two_factor_code(self):
        self.two_factor_code = str(random.randint(100000, 999999))
        self.two_factor_code_expires = timezone.now() + timezone.timedelta(minutes=10)
        self.save()
        return self.two_factor_code

    def verify_two_factor_code(self, code):
        if self.two_factor_code == code and self.two_factor_code_expires > timezone.now():
            self.two_factor_code = None
            self.two_factor_code_expires = None
            self.save()
            return True
        return False

    def generate_reset_password_code(self):
        self.reset_password_code = str(random.randint(100000, 999999))
        self.reset_password_code_expires = timezone.now() + timezone.timedelta(minutes=30)
        self.save()
        return self.reset_password_code

    def verify_reset_password_code(self, code):
        if self.reset_password_code == code and self.reset_password_code_expires > timezone.now():
            return True
        return False

    def reset_password(self, new_password):
        self.set_password(new_password)
        self.reset_password_code = None
        self.reset_password_code_expires = None
        self.save()


class Session(models.Model):
    """
    Modelo para registrar sesiones activas de usuarios
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='sessions')
    dispositivo = models.CharField(max_length=50)
    navegador = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    ubicacion = models.CharField(max_length=200, blank=True, null=True)
    es_actual = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    ultima_actividad = models.DateTimeField(auto_now=True)
    token = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'sesiones'
        ordering = ['-ultima_actividad']
        verbose_name = 'Sesión'
        verbose_name_plural = 'Sesiones'

    def __str__(self):
        return f"{self.usuario.nombre_completo} - {self.dispositivo} ({self.navegador})"


class Proveedor(models.Model):
    """
    Modelo para proveedores de tabaco.
    Normalización: Separado de Lote para evitar duplicación de datos.
    """
    
    class Estado(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        INACTIVO = 'inactivo', 'Inactivo'
    
    nombre = models.CharField(max_length=200, unique=True)
    rfc = models.CharField(max_length=13, unique=True, blank=True, null=True)
    direccion = models.TextField(blank=True)
    telefono = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.ACTIVO)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'proveedores'
        ordering = ['nombre']
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
    
    def __str__(self):
        return self.nombre


class VariedadTabaco(models.Model):
    """
    Modelo para variedades de tabaco.
    Normalización: Separado para mantener un catálogo estándar.
    """
    
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    caracteristicas = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'variedades_tabaco'
        ordering = ['nombre']
        verbose_name = 'Variedad de Tabaco'
        verbose_name_plural = 'Variedades de Tabaco'
    
    def __str__(self):
        return self.nombre


class EtapaProductiva(models.Model):
    """
    Modelo para las etapas del proceso productivo.
    Normalización: Separado para permitir configuración flexible.
    """
    
    nombre = models.CharField(max_length=100, unique=True)
    orden = models.IntegerField(unique=True)
    descripcion = models.TextField(blank=True)
    tiempo_esperado_horas = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0.1)]
    )
    activa = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'etapas_productivas'
        ordering = ['orden']
        verbose_name = 'Etapa Productiva'
        verbose_name_plural = 'Etapas Productivas'
    
    def __str__(self):
        return f"{self.orden}. {self.nombre}"


class Lote(models.Model):
    """
    Modelo principal para lotes de tabaco.
    Normalización: Relaciones con tablas separadas para proveedor, variedad y etapa.
    """
    
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        EN_ESPERA = 'en_espera', 'En Espera'
        EN_PRODUCCION = 'en_produccion', 'En Producción'
        FINALIZADO = 'finalizado', 'Finalizado'
        RECHAZADO = 'rechazado', 'Rechazado'
    
    # Identificación
    codigo = models.CharField(max_length=50, unique=True, db_index=True)
    codigo_qr = models.CharField(max_length=100, unique=True, blank=True)
    
    # Relaciones
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name='lotes')
    variedad = models.ForeignKey(VariedadTabaco, on_delete=models.PROTECT, related_name='lotes')
    etapa_actual = models.ForeignKey(
        EtapaProductiva, 
        on_delete=models.PROTECT, 
        related_name='lotes_en_etapa',
        null=True,
        blank=True
    )
    responsable_actual = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='lotes_asignados'
    )
    
    # Datos del lote
    origen = models.CharField(max_length=200)
    peso_inicial_kg = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    peso_actual_kg = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    cantidad_bultos = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Estado y fechas
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)
    fecha_ingreso = models.DateTimeField(default=timezone.now)
    fecha_inicio_produccion = models.DateTimeField(null=True, blank=True)
    fecha_finalizacion = models.DateTimeField(null=True, blank=True)
    
    # Observaciones
    observaciones_iniciales = models.TextField(blank=True)
    
    # Metadata
    creado_por = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='lotes_creados'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lotes'
        ordering = ['-fecha_creacion']
        verbose_name = 'Lote'
        verbose_name_plural = 'Lotes'
        indexes = [
            models.Index(fields=['codigo']),
            models.Index(fields=['estado']),
            models.Index(fields=['etapa_actual']),
            models.Index(fields=['fecha_ingreso']),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.proveedor.nombre}"
    
    def save(self, *args, **kwargs):
        # Generar código QR si no existe
        if not self.codigo_qr:
            self.codigo_qr = f"QR-{self.codigo}"
        # Peso actual inicialmente igual al peso inicial
        if not self.pk and not self.peso_actual_kg:
            self.peso_actual_kg = self.peso_inicial_kg
        super().save(*args, **kwargs)


class MovimientoLote(models.Model):
    """
    Modelo para registrar el historial de movimientos de lotes entre etapas.
    Normalización: Tabla separada para historial con integridad referencial.
    """
    
    class TipoMovimiento(models.TextChoices):
        INICIO = 'inicio', 'Inicio de Etapa'
        PAUSA = 'pausa', 'Pausa'
        REANUDACION = 'reanudacion', 'Reanudación'
        FINALIZACION = 'finalizacion', 'Finalización de Etapa'
        REASIGNACION = 'reasignacion', 'Reasignación'
    
    class Incidencia(models.TextChoices):
        NINGUNA = 'ninguna', 'Ninguna'
        HUMEDAD = 'humedad', 'Humedad'
        DANOS = 'danos', 'Daños'
        RETRASO = 'retraso', 'Retraso'
        OTRO = 'otro', 'Otro'
    
    class MotivoRetraso(models.TextChoices):
        NINGUNO = 'ninguno', 'Ninguno'
        MAQUINARIA = 'maquinaria', 'Maquinaria'
        PERSONAL = 'personal', 'Personal'
        MATERIA_PRIMA = 'materia_prima', 'Materia Prima'
        CALIDAD = 'calidad', 'Calidad'
        OTRO = 'otro', 'Otro'
    
    # Relaciones
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name='movimientos')
    etapa_origen = models.ForeignKey(
        EtapaProductiva, 
        on_delete=models.PROTECT,
        related_name='movimientos_origen',
        null=True,
        blank=True
    )
    etapa_destino = models.ForeignKey(
        EtapaProductiva, 
        on_delete=models.PROTECT,
        related_name='movimientos_destino',
        null=True,
        blank=True
    )
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    
    # Datos del movimiento
    tipo_movimiento = models.CharField(max_length=20, choices=TipoMovimiento.choices)
    fecha_hora = models.DateTimeField(default=timezone.now)
    cantidad_procesada_kg = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Tiempos
    tiempo_trabajo_minutos = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    tiempo_pausa_minutos = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    
    # Incidencias y observaciones
    incidencias = models.CharField(
        max_length=20, 
        choices=Incidencia.choices, 
        default=Incidencia.NINGUNA
    )
    motivo_retraso = models.CharField(
        max_length=20, 
        choices=MotivoRetraso.choices, 
        default=MotivoRetraso.NINGUNO
    )
    observaciones = models.TextField(blank=True)
    
    class Meta:
        db_table = 'movimientos_lote'
        ordering = ['-fecha_hora']
        verbose_name = 'Movimiento de Lote'
        verbose_name_plural = 'Movimientos de Lote'
        indexes = [
            models.Index(fields=['lote', '-fecha_hora']),
            models.Index(fields=['tipo_movimiento']),
        ]
    
    def __str__(self):
        return f"{self.lote.codigo} - {self.get_tipo_movimiento_display()} - {self.fecha_hora.strftime('%Y-%m-%d %H:%M')}"


class InspeccionCalidad(models.Model):
    """
    Modelo para inspecciones de calidad de lotes.
    Normalización: Separado de Lote para permitir múltiples inspecciones.
    """
    
    class EstadoCalidad(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        EN_INSPECCION = 'en_inspeccion', 'En Inspección'
        APROBADO = 'aprobado', 'Aprobado'
        APROBADO_CON_OBSERVACIONES = 'aprobado_con_observaciones', 'Aprobado con Observaciones'
        RECHAZADO = 'rechazado', 'Rechazado'
    
    class GradoCalidad(models.TextChoices):
        A = 'A', 'A - Excelente'
        B = 'B', 'B - Bueno'
        C = 'C', 'C - Aceptable'
        D = 'D', 'D - Deficiente'
    
    class MotivoRechazo(models.TextChoices):
        NINGUNO = 'ninguno', 'Ninguno'
        HUMEDAD_EXCESIVA = 'humedad_excesiva', 'Humedad Excesiva'
        DANOS_FISICOS = 'danos_fisicos', 'Daños Físicos'
        PESO_INCORRECTO = 'peso_incorrecto', 'Peso Incorrecto'
        CONTAMINACION = 'contaminacion', 'Contaminación'
        MALA_CLASIFICACION = 'mala_clasificacion', 'Mala Clasificación'
        OTRO = 'otro', 'Otro'
    
    class Decision(models.TextChoices):
        APROBAR = 'aprobar', 'Aprobar Lote'
        RECHAZAR = 'rechazar', 'Rechazar Lote'
        SOLICITAR_CORRECCION = 'solicitar_correccion', 'Solicitar Corrección'
        SOLICITAR_REINSPECCION = 'solicitar_reinspeccion', 'Solicitar Reinspección'
    
    # Relaciones
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name='inspecciones')
    etapa = models.ForeignKey(EtapaProductiva, on_delete=models.PROTECT)
    inspector = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    
    # Datos de la inspección
    estado_calidad = models.CharField(
        max_length=30, 
        choices=EstadoCalidad.choices, 
        default=EstadoCalidad.PENDIENTE
    )
    grado_calidad = models.CharField(max_length=1, choices=GradoCalidad.choices, null=True, blank=True)
    
    # Mediciones
    temperatura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    humedad = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    peso_kg = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Checklist
    humedad_correcta = models.BooleanField(default=False)
    temperatura_correcta = models.BooleanField(default=False)
    peso_correcto = models.BooleanField(default=False)
    embalaje_correcto = models.BooleanField(default=False)
    etiquetado_correcto = models.BooleanField(default=False)
    qr_legible = models.BooleanField(default=False)
    qr_verificado = models.BooleanField(default=False)
    
    # Decisión y motivos
    decision = models.CharField(max_length=30, choices=Decision.choices, null=True, blank=True)
    motivo_rechazo = models.CharField(
        max_length=30, 
        choices=MotivoRechazo.choices, 
        default=MotivoRechazo.NINGUNO
    )
    observaciones = models.TextField(blank=True)
    
    # Tiempos
    fecha_hora_inicio = models.DateTimeField(default=timezone.now)
    fecha_hora_fin = models.DateTimeField(null=True, blank=True)
    duracion_minutos = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    
    # Metadata
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inspecciones_calidad'
        ordering = ['-fecha_hora_inicio']
        verbose_name = 'Inspección de Calidad'
        verbose_name_plural = 'Inspecciones de Calidad'
        indexes = [
            models.Index(fields=['lote', '-fecha_hora_inicio']),
            models.Index(fields=['estado_calidad']),
        ]
    
    def __str__(self):
        return f"Inspección {self.lote.codigo} - {self.get_estado_calidad_display()}"
    
    def save(self, *args, **kwargs):
        # Calcular duración si hay fecha de fin
        if self.fecha_hora_fin and self.fecha_hora_inicio:
            duracion = (self.fecha_hora_fin - self.fecha_hora_inicio).total_seconds() / 60
            self.duracion_minutos = int(duracion)
        super().save(*args, **kwargs)


class EvidenciaCalidad(models.Model):
    """
    Modelo para evidencias fotográficas o documentales de inspecciones.
    Normalización: Tabla separada para permitir múltiples evidencias por inspección.
    """
    
    class TipoEvidencia(models.TextChoices):
        FOTO = 'foto', 'Fotografía'
        DOCUMENTO = 'documento', 'Documento'
    
    inspeccion = models.ForeignKey(
        InspeccionCalidad, 
        on_delete=models.CASCADE, 
        related_name='evidencias'
    )
    tipo = models.CharField(max_length=10, choices=TipoEvidencia.choices, default=TipoEvidencia.FOTO)
    archivo = models.FileField(upload_to='evidencias/%Y/%m/%d/')
    descripcion = models.CharField(max_length=200, blank=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'evidencias_calidad'
        ordering = ['-fecha_subida']
        verbose_name = 'Evidencia de Calidad'
        verbose_name_plural = 'Evidencias de Calidad'
    
    def __str__(self):
        return f"Evidencia {self.tipo} - {self.inspeccion}"


class Observacion(models.Model):
    """
    Modelo para observaciones generales sobre lotes.
    Normalización: Separado para permitir múltiples observaciones independientes.
    """
    
    class TipoObservacion(models.TextChoices):
        GENERAL = 'general', 'General'
        ALERTA = 'alerta', 'Alerta'
        INCIDENCIA = 'incidencia', 'Incidencia'
        NOTA = 'nota', 'Nota'
    
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name='observaciones')
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    tipo = models.CharField(max_length=15, choices=TipoObservacion.choices, default=TipoObservacion.GENERAL)
    contenido = models.TextField()
    fecha_hora = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'observaciones'
        ordering = ['-fecha_hora']
        verbose_name = 'Observación'
        verbose_name_plural = 'Observaciones'
        indexes = [
            models.Index(fields=['lote', '-fecha_hora']),
        ]
    
    def __str__(self):
        return f"Observación {self.lote.codigo} - {self.fecha_hora.strftime('%Y-%m-%d')}"


class Alerta(models.Model):
    """
    Modelo para alertas y notificaciones del sistema.
    Normalización: Tabla separada para gestión independiente de alertas.
    """
    
    class TipoAlerta(models.TextChoices):
        RETRASO = 'retraso', 'Retraso en Etapa'
        CUELLO_BOTELLA = 'cuello_botella', 'Cuello de Botella'
        CALIDAD_RECHAZADA = 'calidad_rechazada', 'Calidad Rechazada'
        SISTEMA = 'sistema', 'Sistema'
    
    class SeveridadAlerta(models.TextChoices):
        BAJA = 'baja', 'Baja'
        MEDIA = 'media', 'Media'
        ALTA = 'alta', 'Alta'
        CRITICA = 'critica', 'Crítica'
    
    class EstadoAlerta(models.TextChoices):
        ACTIVA = 'activa', 'Activa'
        RESUELTA = 'resuelta', 'Resuelta'
        IGNORADA = 'ignorada', 'Ignorada'
    
    # Relaciones
    lote = models.ForeignKey(
        Lote, 
        on_delete=models.CASCADE, 
        related_name='alertas',
        null=True,
        blank=True
    )
    etapa = models.ForeignKey(
        EtapaProductiva, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Datos de la alerta
    tipo = models.CharField(max_length=20, choices=TipoAlerta.choices)
    severidad = models.CharField(max_length=10, choices=SeveridadAlerta.choices, default=SeveridadAlerta.MEDIA)
    estado = models.CharField(max_length=10, choices=EstadoAlerta.choices, default=EstadoAlerta.ACTIVA)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    
    # Fechas
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    resuelto_por = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='alertas_resueltas'
    )
    
    class Meta:
        db_table = 'alertas'
        ordering = ['-fecha_creacion']
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'
        indexes = [
            models.Index(fields=['estado', '-fecha_creacion']),
            models.Index(fields=['tipo']),
            models.Index(fields=['severidad']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.titulo}"


class EventoSistema(models.Model):
    """
    Modelo para registrar eventos importantes del sistema (auditoría).
    Normalización: Tabla separada para log de eventos del sistema.
    """
    
    class TipoEvento(models.TextChoices):
        CREACION_LOTE = 'creacion_lote', 'Creación de Lote'
        MOVIMIENTO_ETAPA = 'movimiento_etapa', 'Movimiento de Etapa'
        INSPECCION_CALIDAD = 'inspeccion_calidad', 'Inspección de Calidad'
        CAMBIO_ESTADO_LOTE = 'cambio_estado_lote', 'Cambio de Estado de Lote'
        CREACION_USUARIO = 'creacion_usuario', 'Creación de Usuario'
        MODIFICACION_USUARIO = 'modificacion_usuario', 'Modificación de Usuario'
        LOGIN = 'login', 'Inicio de Sesión'
        LOGOUT = 'logout', 'Cierre de Sesión'
        ALERTA_GENERADA = 'alerta_generada', 'Alerta Generada'
    
    tipo = models.CharField(max_length=30, choices=TipoEvento.choices)
    usuario = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True
    )
    lote = models.ForeignKey(
        Lote, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='eventos'
    )
    descripcion = models.TextField()
    datos_adicionales = models.JSONField(null=True, blank=True)
    fecha_hora = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'eventos_sistema'
        ordering = ['-fecha_hora']
        verbose_name = 'Evento del Sistema'
        verbose_name_plural = 'Eventos del Sistema'
        indexes = [
            models.Index(fields=['-fecha_hora']),
            models.Index(fields=['tipo']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.fecha_hora.strftime('%Y-%m-%d %H:%M')}"
