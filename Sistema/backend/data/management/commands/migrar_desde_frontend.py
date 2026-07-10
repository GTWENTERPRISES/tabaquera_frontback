"""
Migra TODOS los datos de lib/mock-data.ts y lib/constants.ts al backend Django.
Incluye: usuarios, proveedores, variedades, etapas, lotes, movimientos,
         inspecciones de calidad (con checklist), observaciones, alertas y eventos.

Uso:
    python manage.py migrate          # crear tablas
    python manage.py migrar_desde_frontend
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from data.models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva,
    Lote, MovimientoLote, InspeccionCalidad, Observacion,
    Alerta, EventoSistema,
)

# ─────────────────────────────────────────────────────────────────────────────
# DATOS EXACTOS DEL FRONTEND
# ─────────────────────────────────────────────────────────────────────────────

USUARIOS = [
    {
        'username': 'carlos.martinez', 'nombres': 'Carlos', 'apellidos': 'Martinez',
        'email': 'admin@goldenleaf.com', 'telefono': '5058888101',
        'rol': 'administrador', 'departamento': 'administracion',
        'password': 'admin123',
    },
    {
        'username': 'maria.lopez', 'nombres': 'Maria', 'apellidos': 'Lopez',
        'email': 'supervisor@goldenleaf.com', 'telefono': '5058888102',
        'rol': 'supervisor', 'departamento': 'produccion',
        'password': 'supervisor123',
    },
    {
        'username': 'juan.garcia', 'nombres': 'Juan', 'apellidos': 'Garcia',
        'email': 'operator@goldenleaf.com', 'telefono': '5058888103',
        'rol': 'operario', 'departamento': 'produccion',
        'password': 'operario123',
    },
    {
        'username': 'ana.rodriguez', 'nombres': 'Ana', 'apellidos': 'Rodriguez',
        'email': 'quality@goldenleaf.com', 'telefono': '5058888104',
        'rol': 'control_calidad', 'departamento': 'calidad',
        'password': 'calidad123',
    },
]

PROVEEDORES = [
    {'nombre': 'Tabacalera del Norte',  'email': 'contacto@tabacaleranorte.com',  'telefono': '5051234001'},
    {'nombre': 'Hojas Selectas S.A.',   'email': 'ventas@hojaselectas.com',        'telefono': '5051234002'},
    {'nombre': 'Tabacos Premium',       'email': 'info@tabacospremium.com',         'telefono': '5051234003'},
    {'nombre': 'Cultivos del Valle',    'email': 'ventas@cultivosdelvalle.com',     'telefono': '5051234004'},
    {'nombre': 'Golden Fields',         'email': 'contacto@goldenfields.com',       'telefono': '5051234005'},
    {'nombre': 'Plantaciones del Sur',  'email': 'info@plantacionesdelsur.com',     'telefono': '5051234006'},
]

VARIEDADES = [
    {'nombre': 'Corojo',      'descripcion': 'Variedad robusta de origen cubano, sabor intenso y picante'},
    {'nombre': 'Habano',      'descripcion': 'Variedad premium para puros, sabor complejo y aromático'},
    {'nombre': 'Connecticut', 'descripcion': 'Variedad suave de hoja clara, aroma delicado'},
    {'nombre': 'Criollo',     'descripcion': 'Variedad tradicional adaptada a climas locales'},
    {'nombre': 'Maduro',      'descripcion': 'Hoja oscura de fermentación prolongada, sabor dulce'},
    {'nombre': 'Sumatra',     'descripcion': 'Hoja aromática fina, ideal para capas de puro'},
]

ETAPAS = [
    {'nombre': 'Recepción',      'orden': 1, 'descripcion': 'Recepción, verificación y pesaje inicial del lote',      'horas': 2.0},
    {'nombre': 'Clasificación',  'orden': 2, 'descripcion': 'Clasificación por tamaño, color y calidad visual',        'horas': 8.0},
    {'nombre': 'Selección',      'orden': 3, 'descripcion': 'Selección manual de hojas según estándares de calidad',   'horas': 12.0},
    {'nombre': 'Empaque',        'orden': 4, 'descripcion': 'Empaque, etiquetado y preparación para distribución',     'horas': 4.0},
    {'nombre': 'Distribución',   'orden': 5, 'descripcion': 'Almacenamiento final y preparación para envío',           'horas': 2.0},
]


# Etapa key → nombre Django
ETAPA_KEY = {
    'reception':     'Recepción',
    'classification':'Clasificación',
    'selection':     'Selección',
    'packaging':     'Empaque',
    'distribution':  'Distribución',
}

LOTES = [
    {
        'code': 'LT-2026-001', 'origin': 'Esteli',
        'variety': 'Corojo',       'supplier': 'Tabacalera del Norte',
        'entryDate': '2026-05-15', 'initialWeight': 1850, 'currentWeight': 1720,
        'quantityBales': 25,  'currentStage': 'selection',    'status': 'active',
        'responsibleUsername': 'carlos.martinez',
        'notes': 'Lote de Corojo desde Esteli - Calidad esperada A',
    },
    {
        'code': 'LT-2026-002', 'origin': 'Jalapa',
        'variety': 'Habano',       'supplier': 'Hojas Selectas S.A.',
        'entryDate': '2026-05-18', 'initialWeight': 2100, 'currentWeight': 2050,
        'quantityBales': 30,  'currentStage': 'classification','status': 'active',
        'responsibleUsername': 'maria.lopez',
        'notes': 'Lote de Habano desde Jalapa - Calidad esperada A',
    },
    {
        'code': 'LT-2026-003', 'origin': 'Condega',
        'variety': 'Connecticut',  'supplier': 'Tabacos Premium',
        'entryDate': '2026-05-20', 'initialWeight': 1650, 'currentWeight': 1600,
        'quantityBales': 20,  'currentStage': 'reception',    'status': 'active',
        'responsibleUsername': 'juan.garcia',
        'notes': 'Lote de Connecticut desde Condega - Calidad esperada B',
    },
    {
        'code': 'LT-2026-004', 'origin': 'Ometepe',
        'variety': 'Criollo',      'supplier': 'Cultivos del Valle',
        'entryDate': '2026-05-10', 'initialWeight': 1920, 'currentWeight': 1750,
        'quantityBales': 28,  'currentStage': 'classification','status': 'active',
        'responsibleUsername': 'carlos.martinez',
        'notes': 'Lote de Criollo desde Ometepe - Calidad esperada A',
    },
    {
        'code': 'LT-2026-005', 'origin': 'Nueva Segovia',
        'variety': 'Maduro',       'supplier': 'Golden Fields',
        'entryDate': '2026-05-05', 'initialWeight': 2200, 'currentWeight': 1980,
        'quantityBales': 32,  'currentStage': 'packaging',    'status': 'active',
        'responsibleUsername': 'maria.lopez',
        'notes': 'Lote de Maduro desde Nueva Segovia - Calidad esperada A',
    },
    {
        'code': 'LT-2026-006', 'origin': 'Matagalpa',
        'variety': 'Sumatra',      'supplier': 'Plantaciones del Sur',
        'entryDate': '2026-04-28', 'initialWeight': 1780, 'currentWeight': 1520,
        'quantityBales': 22,  'currentStage': 'distribution', 'status': 'active',
        'responsibleUsername': 'juan.garcia',
        'notes': 'Lote de Sumatra desde Matagalpa - Calidad esperada B',
    },
    {
        'code': 'LT-2026-007', 'origin': 'Esteli',
        'variety': 'Habano',       'supplier': 'Tabacalera del Norte',
        'entryDate': '2026-04-20', 'initialWeight': 2050, 'currentWeight': 1720,
        'quantityBales': 26,  'currentStage': 'distribution', 'status': 'completed',
        'responsibleUsername': 'carlos.martinez',
        'notes': 'Lote de Habano desde Esteli - Completado',
    },
    {
        'code': 'LT-2026-008', 'origin': 'Jalapa',
        'variety': 'Corojo',       'supplier': 'Hojas Selectas S.A.',
        'entryDate': '2026-05-22', 'initialWeight': 1550, 'currentWeight': 1550,
        'quantityBales': 18,  'currentStage': 'reception',    'status': 'active',
        'responsibleUsername': 'maria.lopez',
        'notes': 'Lote de Corojo desde Jalapa - Calidad esperada B',
    },
]


# Movimientos por etapa según el mock (stageUsers en generateLotMovements)
# username del responsable por etapa
ETAPA_RESPONSABLE = {
    'reception':     'juan.garcia',
    'classification':'maria.lopez',
    'selection':     'carlos.martinez',
    'packaging':     'juan.garcia',
    'distribution':  'maria.lopez',
}

# Orden de etapas para reconstruir historial
STAGE_ORDER = ['reception', 'classification', 'selection', 'packaging', 'distribution']

# ─── Inspecciones de calidad (baseMockQualityChecks) ─────────────────────────

INSPECCIONES = [
    {
        'lotCode': 'LT-2026-001', 'stageKey': 'selection',
        'grade': 'A',  'temperature': 28.5, 'humidity': 68.0, 'weight': 1720,
        'status': 'aprobado',  'inspectorUsername': 'ana.rodriguez',
        'startTime': '2026-06-01T09:00:00', 'endTime': '2026-06-01T09:15:00', 'duration': 15,
        'decision': 'aprobar', 'motivo_rechazo': 'ninguno', 'notes': '',
        'checklist': {'humedad': True, 'temperatura': True, 'peso': True,
                      'embalaje': True, 'etiquetado': True, 'qr': True},
    },
    {
        'lotCode': 'LT-2026-002', 'stageKey': 'classification',
        'grade': 'A',  'temperature': 32.0, 'humidity': 55.0, 'weight': 2050,
        'status': 'aprobado',  'inspectorUsername': 'ana.rodriguez',
        'startTime': '2026-05-31T10:30:00', 'endTime': '2026-05-31T10:48:00', 'duration': 18,
        'decision': 'aprobar', 'motivo_rechazo': 'ninguno', 'notes': '',
        'checklist': {'humedad': True, 'temperatura': True, 'peso': True,
                      'embalaje': True, 'etiquetado': True, 'qr': True},
    },
    {
        'lotCode': 'LT-2026-004', 'stageKey': 'classification',
        'grade': 'B',  'temperature': 24.0, 'humidity': 62.0, 'weight': 1750,
        'status': 'aprobado_con_observaciones', 'inspectorUsername': 'ana.rodriguez',
        'startTime': '2026-05-30T14:15:00', 'endTime': '2026-05-30T14:32:00', 'duration': 17,
        'decision': 'aprobar', 'motivo_rechazo': 'ninguno',
        'notes': 'Humedad ligeramente por encima del rango optimo',
        'checklist': {'humedad': False, 'temperatura': True, 'peso': True,
                      'embalaje': True, 'etiquetado': True, 'qr': True},
    },
    {
        'lotCode': 'LT-2026-005', 'stageKey': 'packaging',
        'grade': 'A',  'temperature': 22.0, 'humidity': 58.0, 'weight': 1980,
        'status': 'aprobado',  'inspectorUsername': 'ana.rodriguez',
        'startTime': '2026-05-29T08:45:00', 'endTime': '2026-05-29T09:02:00', 'duration': 17,
        'decision': 'aprobar', 'motivo_rechazo': 'ninguno', 'notes': '',
        'checklist': {'humedad': True, 'temperatura': True, 'peso': True,
                      'embalaje': True, 'etiquetado': True, 'qr': True},
    },
    {
        'lotCode': 'LT-2026-006', 'stageKey': 'distribution',
        'grade': 'B',  'temperature': 20.5, 'humidity': 60.0, 'weight': 1520,
        'status': 'aprobado',  'inspectorUsername': 'ana.rodriguez',
        'startTime': '2026-05-28T16:20:00', 'endTime': '2026-05-28T16:38:00', 'duration': 18,
        'decision': 'aprobar', 'motivo_rechazo': 'ninguno', 'notes': '',
        'checklist': {'humedad': True, 'temperatura': True, 'peso': True,
                      'embalaje': True, 'etiquetado': True, 'qr': True},
    },
    {
        'lotCode': 'LT-2026-007', 'stageKey': 'distribution',
        'grade': 'A',  'temperature': 21.0, 'humidity': 55.0, 'weight': 1720,
        'status': 'aprobado',  'inspectorUsername': 'ana.rodriguez',
        'startTime': '2026-05-27T11:00:00', 'endTime': '2026-05-27T11:18:00', 'duration': 18,
        'decision': 'aprobar', 'motivo_rechazo': 'ninguno', 'notes': '',
        'checklist': {'humedad': True, 'temperatura': True, 'peso': True,
                      'embalaje': True, 'etiquetado': True, 'qr': True},
    },
    {
        'lotCode': 'LT-2026-003', 'stageKey': 'reception',
        'grade': 'C',  'temperature': 26.0, 'humidity': 72.0, 'weight': 1600,
        'status': 'rechazado', 'inspectorUsername': 'ana.rodriguez',
        'startTime': '2026-05-26T13:30:00', 'endTime': '2026-05-26T13:50:00', 'duration': 20,
        'decision': 'solicitar_correccion', 'motivo_rechazo': 'humedad_excesiva',
        'notes': 'Humedad excesiva, requiere secado adicional',
        'checklist': {'humedad': False, 'temperatura': True, 'peso': True,
                      'embalaje': True, 'etiquetado': True, 'qr': True},
    },
]


# ─── Actividades → Eventos + Observaciones (mockActivities) ──────────────────

ACTIVIDADES = [
    {
        'id': 'act-001', 'type': 'creacion_lote',
        'description': 'Se registro el lote LT-2026-008 proveniente de Jalapa',
        'date': '2026-06-02T10:30:00', 'userUsername': 'maria.lopez',
        'lotCode': 'LT-2026-008',
    },
    {
        'id': 'act-002', 'type': 'inspeccion_calidad',
        'description': 'Control de calidad aprobado para LT-2026-001',
        'date': '2026-06-01T15:45:00', 'userUsername': 'ana.rodriguez',
        'lotCode': 'LT-2026-001',
    },
    {
        'id': 'act-003', 'type': 'movimiento_etapa',
        'description': 'Inicio de empaque para LT-2026-005',
        'date': '2026-06-01T09:00:00', 'userUsername': 'juan.garcia',
        'lotCode': 'LT-2026-005',
    },
    {
        'id': 'act-004', 'type': 'alerta_generada',
        'description': 'LT-2026-003 requiere revision - humedad fuera de rango',
        'date': '2026-05-31T14:20:00', 'userUsername': 'carlos.martinez',
        'lotCode': 'LT-2026-003',
    },
    {
        'id': 'act-005', 'type': 'cambio_estado_lote',
        'description': 'LT-2026-007 completo el proceso de distribucion',
        'date': '2026-05-30T16:30:00', 'userUsername': 'carlos.martinez',
        'lotCode': 'LT-2026-007',
    },
    {
        'id': 'act-006', 'type': 'movimiento_etapa',
        'description': 'LT-2026-002 paso de Recepcion a Clasificacion',
        'date': '2026-05-29T10:00:00', 'userUsername': 'juan.garcia',
        'lotCode': 'LT-2026-002',
    },
    {
        'id': 'act-007', 'type': 'inspeccion_calidad',
        'description': 'Control de calidad para LT-2026-004 con observaciones',
        'date': '2026-05-28T14:00:00', 'userUsername': 'ana.rodriguez',
        'lotCode': 'LT-2026-004',
    },
]

# ─── Alertas del mock (mockActivities tipo alert + alertas adicionales) ──────

ALERTAS = [
    # De mockActivities act-004
    {
        'lotCode': 'LT-2026-003', 'stageKey': 'reception',
        'tipo': 'calidad_rechazada', 'severidad': 'alta', 'estado': 'activa',
        'titulo': 'LT-2026-003 requiere revisión — humedad fuera de rango',
        'descripcion': 'El lote presentó humedad de 72% en Recepción. '
                       'Requiere secado adicional antes de continuar.',
        'fecha': '2026-05-31T14:20:00',
    },
    # Retraso LT-2026-004
    {
        'lotCode': 'LT-2026-004', 'stageKey': 'classification',
        'tipo': 'retraso', 'severidad': 'media', 'estado': 'activa',
        'titulo': 'Retraso en clasificación — LT-2026-004',
        'descripcion': 'El lote está tardando más de lo esperado en Clasificación.',
        'fecha': '2026-05-30T10:00:00',
    },
]

# ─── Notificaciones de ejemplo por rol (notification-examples.ts) ─────────────
# Estas se guardan como Alertas adicionales con distintos tipos/severidades

NOTIFICACIONES_EJEMPLO = [
    # ── Admin / Supervisor ────────────────────────────────────────────────────
    # "Nuevo lote registrado" × 5 lotes → tipo sistema, severidad baja
    {'lotCode': 'LT-2026-001', 'stageKey': None, 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'activa', 'titulo': 'Nuevo lote registrado',
     'descripcion': 'Carlos Martínez creó el lote LT-2026-001.',
     'fecha': '2026-06-02T10:25:00'},
    {'lotCode': 'LT-2026-002', 'stageKey': None, 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'activa', 'titulo': 'Nuevo lote registrado',
     'descripcion': 'Carlos Martínez creó el lote LT-2026-002.',
     'fecha': '2026-06-02T10:20:00'},
    {'lotCode': 'LT-2026-003', 'stageKey': None, 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'resuelta', 'titulo': 'Nuevo lote registrado',
     'descripcion': 'Carlos Martínez creó el lote LT-2026-003.',
     'fecha': '2026-06-02T10:15:00'},
    {'lotCode': 'LT-2026-004', 'stageKey': None, 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'resuelta', 'titulo': 'Nuevo lote registrado',
     'descripcion': 'Carlos Martínez creó el lote LT-2026-004.',
     'fecha': '2026-06-02T10:10:00'},
    {'lotCode': 'LT-2026-005', 'stageKey': None, 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'resuelta', 'titulo': 'Nuevo lote registrado',
     'descripcion': 'Carlos Martínez creó el lote LT-2026-005.',
     'fecha': '2026-06-02T10:05:00'},
    # "Lote rechazado" × 2
    {'lotCode': 'LT-2026-001', 'stageKey': 'reception', 'tipo': 'calidad_rechazada', 'severidad': 'critica',
     'estado': 'activa', 'titulo': 'Lote rechazado',
     'descripcion': 'LT-2026-001 fue rechazado por humedad elevada.',
     'fecha': '2026-06-02T09:30:00'},
    {'lotCode': 'LT-2026-002', 'stageKey': 'classification', 'tipo': 'calidad_rechazada', 'severidad': 'critica',
     'estado': 'resuelta', 'titulo': 'Lote rechazado',
     'descripcion': 'LT-2026-002 fue rechazado por humedad elevada.',
     'fecha': '2026-06-02T09:00:00'},
    # "Retraso crítico" × 1
    {'lotCode': 'LT-2026-001', 'stageKey': 'selection', 'tipo': 'retraso', 'severidad': 'critica',
     'estado': 'resuelta', 'titulo': 'Retraso crítico',
     'descripcion': 'LT-2026-001 supera el tiempo máximo permitido.',
     'fecha': '2026-06-02T08:30:00'},
    # "Usuario creado" → sistema sin lote
    {'lotCode': None, 'stageKey': None, 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'resuelta', 'titulo': 'Usuario creado',
     'descripcion': 'Pedro Sánchez fue registrado como Operario.',
     'fecha': '2026-06-02T09:20:00'},
    # ── Operario ──────────────────────────────────────────────────────────────
    # "Nuevo lote asignado" × 4
    {'lotCode': 'LT-2026-001', 'stageKey': 'selection', 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'activa', 'titulo': 'Nuevo lote asignado',
     'descripcion': 'Se asignó LT-2026-001 para Selección.',
     'fecha': '2026-06-02T09:40:00'},
    {'lotCode': 'LT-2026-002', 'stageKey': 'classification', 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'activa', 'titulo': 'Nuevo lote asignado',
     'descripcion': 'Se asignó LT-2026-002 para Clasificación.',
     'fecha': '2026-06-02T09:20:00'},
    {'lotCode': 'LT-2026-003', 'stageKey': 'reception', 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'resuelta', 'titulo': 'Nuevo lote asignado',
     'descripcion': 'Se asignó LT-2026-003 para Recepción.',
     'fecha': '2026-06-02T09:00:00'},
    {'lotCode': 'LT-2026-004', 'stageKey': 'classification', 'tipo': 'sistema', 'severidad': 'baja',
     'estado': 'resuelta', 'titulo': 'Nuevo lote asignado',
     'descripcion': 'Se asignó LT-2026-004 para Clasificación.',
     'fecha': '2026-06-02T08:40:00'},
    # "Próximo retraso"
    {'lotCode': 'LT-2026-001', 'stageKey': 'selection', 'tipo': 'retraso', 'severidad': 'media',
     'estado': 'activa', 'titulo': 'Próximo retraso',
     'descripcion': 'LT-2026-001 está próximo a exceder el tiempo permitido.',
     'fecha': '2026-06-02T09:45:00'},
    # ── Control de calidad ────────────────────────────────────────────────────
    # "Inspección pendiente" × 3
    {'lotCode': 'LT-2026-001', 'stageKey': 'selection', 'tipo': 'cuello_botella', 'severidad': 'media',
     'estado': 'activa', 'titulo': 'Inspección pendiente',
     'descripcion': 'LT-2026-001 requiere inspección de calidad.',
     'fecha': '2026-06-02T09:35:00'},
    {'lotCode': 'LT-2026-002', 'stageKey': 'classification', 'tipo': 'cuello_botella', 'severidad': 'media',
     'estado': 'activa', 'titulo': 'Inspección pendiente',
     'descripcion': 'LT-2026-002 requiere inspección de calidad.',
     'fecha': '2026-06-02T09:10:00'},
    {'lotCode': 'LT-2026-003', 'stageKey': 'reception', 'tipo': 'cuello_botella', 'severidad': 'media',
     'estado': 'resuelta', 'titulo': 'Inspección pendiente',
     'descripcion': 'LT-2026-003 requiere inspección de calidad.',
     'fecha': '2026-06-02T08:45:00'},
]

# ─────────────────────────────────────────────────────────────────────────────
# COMMAND
# ─────────────────────────────────────────────────────────────────────────────

def _dt(date_str):
    """Parsea fecha ISO y la hace timezone-aware."""
    if 'T' in date_str:
        dt = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    else:
        dt = datetime.strptime(date_str, '%Y-%m-%d')
    return timezone.make_aware(dt)


class Command(BaseCommand):
    help = 'Migra TODOS los mocks del frontend al backend Django'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('=' * 65))
        self.stdout.write(self.style.SUCCESS(' Migrando datos completos del frontend → Django'))
        self.stdout.write(self.style.SUCCESS('=' * 65))

        self._limpiar()
        self._crear_usuarios()
        self._crear_catalogos()
        self._crear_lotes()
        self._crear_inspecciones()
        self._crear_eventos()
        self._crear_alertas()
        self._crear_notificaciones_ejemplo()
        self._resumen()


    # ── Limpieza total ────────────────────────────────────────────────────────

    def _limpiar(self):
        self.stdout.write('\n🗑  Limpiando base de datos...')
        EventoSistema.objects.all().delete()
        Alerta.objects.all().delete()
        Observacion.objects.all().delete()
        InspeccionCalidad.objects.all().delete()
        MovimientoLote.objects.all().delete()
        Lote.objects.all().delete()
        Proveedor.objects.all().delete()
        VariedadTabaco.objects.all().delete()
        EtapaProductiva.objects.all().delete()
        Usuario.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('   ✓ Limpio'))

    # ── Usuarios ──────────────────────────────────────────────────────────────

    def _crear_usuarios(self):
        self.stdout.write('\n👤 Creando usuarios...')
        self.usuarios = {}
        for u in USUARIOS:
            obj = Usuario.objects.create_user(
                username=u['username'],
                email=u['email'],
                password=u['password'],
                nombres=u['nombres'],
                apellidos=u['apellidos'],
                telefono=u['telefono'],
                rol=u['rol'],
                departamento=u['departamento'],
                estado='activo',
                is_staff=(u['rol'] == 'administrador'),
                is_superuser=(u['rol'] == 'administrador'),
            )
            self.usuarios[u['username']] = obj
            self.stdout.write(f'   ✓ {u["username"]}  ({u["rol"]})  pass: {u["password"]}')

    # ── Catálogos ─────────────────────────────────────────────────────────────

    def _crear_catalogos(self):
        self.stdout.write('\n📦 Creando catálogos...')

        self.proveedores = {}
        for p in PROVEEDORES:
            obj = Proveedor.objects.create(
                nombre=p['nombre'], email=p['email'],
                telefono=p['telefono'], estado='activo',
            )
            self.proveedores[p['nombre']] = obj

        self.variedades = {}
        for v in VARIEDADES:
            obj = VariedadTabaco.objects.create(
                nombre=v['nombre'], descripcion=v['descripcion'], activo=True,
            )
            self.variedades[v['nombre']] = obj

        self.etapas = {}
        self.etapas_by_nombre = {}
        for e in ETAPAS:
            obj = EtapaProductiva.objects.create(
                nombre=e['nombre'], orden=e['orden'],
                descripcion=e['descripcion'],
                tiempo_esperado_horas=e['horas'], activa=True,
            )
            self.etapas[e['nombre']] = obj
            self.etapas_by_nombre[e['nombre']] = obj

        self.stdout.write(self.style.SUCCESS(
            f'   ✓ {len(PROVEEDORES)} proveedores, {len(VARIEDADES)} variedades, {len(ETAPAS)} etapas'
        ))


    # ── Lotes + Movimientos ───────────────────────────────────────────────────

    def _crear_lotes(self):
        self.stdout.write('\n📋 Creando lotes y movimientos...')
        self.lotes = {}

        ESTADO_MAP = {
            'active':    Lote.Estado.EN_PRODUCCION,
            'completed': Lote.Estado.FINALIZADO,
            'rejected':  Lote.Estado.RECHAZADO,
        }

        for ld in LOTES:
            proveedor   = self.proveedores[ld['supplier']]
            variedad    = self.variedades[ld['variety']]
            etapa_nombre = ETAPA_KEY[ld['currentStage']]
            etapa_actual = self.etapas[etapa_nombre]
            estado       = ESTADO_MAP[ld['status']]
            responsable  = self.usuarios[ld['responsibleUsername']]
            fecha_ingreso = _dt(ld['entryDate'])

            lote = Lote.objects.create(
                codigo=ld['code'],
                codigo_qr=f"QR-{ld['code']}",
                proveedor=proveedor,
                variedad=variedad,
                origen=ld['origin'],
                peso_inicial_kg=ld['initialWeight'],
                peso_actual_kg=ld['currentWeight'],
                cantidad_bultos=ld['quantityBales'],
                estado=estado,
                etapa_actual=etapa_actual,
                responsable_actual=responsable if estado == Lote.Estado.EN_PRODUCCION else None,
                fecha_ingreso=fecha_ingreso,
                fecha_inicio_produccion=fecha_ingreso + timedelta(hours=2),
                fecha_finalizacion=fecha_ingreso + timedelta(days=40)
                    if estado == Lote.Estado.FINALIZADO else None,
                observaciones_iniciales=ld['notes'],
                creado_por=self.usuarios['carlos.martinez'],
            )
            self.lotes[ld['code']] = lote
            self._crear_movimientos(lote, ld, fecha_ingreso)
            self.stdout.write(self.style.SUCCESS(
                f'   ✓ {ld["code"]}  {ld["currentStage"]:15s}  {ld["status"]}'
            ))

    def _crear_movimientos(self, lote, ld, fecha_ingreso):
        """Recrea el historial de movimientos según el currentStage del lote."""
        stage_idx   = STAGE_ORDER.index(ld['currentStage'])
        etapas_ord  = STAGE_ORDER[: stage_idx + 1]
        fecha       = fecha_ingreso + timedelta(hours=8)   # 8:00 AM
        etapa_ant   = None

        durations_h = {'reception': 2, 'classification': 8, 'selection': 12, 'packaging': 4, 'distribution': 2}

        for i, stage_key in enumerate(etapas_ord):
            etapa_obj  = self.etapas[ETAPA_KEY[stage_key]]
            op_user    = self.usuarios[ETAPA_RESPONSABLE[stage_key]]
            is_current = (stage_key == ld['currentStage'])
            duracion   = durations_h[stage_key] * 60   # minutos

            if i == 0:
                # Movimiento de inicio en Recepción
                MovimientoLote.objects.create(
                    lote=lote, etapa_destino=etapa_obj, usuario=op_user,
                    tipo_movimiento='inicio',
                    observaciones='Ingreso y verificación inicial del lote',
                    fecha_hora=fecha,
                )
            else:
                # Finalización de etapa anterior
                MovimientoLote.objects.create(
                    lote=lote,
                    etapa_origen=self.etapas[ETAPA_KEY[STAGE_ORDER[i - 1]]],
                    etapa_destino=etapa_obj,
                    usuario=op_user,
                    tipo_movimiento='finalizacion',
                    cantidad_procesada_kg=lote.peso_actual_kg,
                    tiempo_trabajo_minutos=duracion,
                    incidencias='ninguna',
                    motivo_retraso='ninguno',
                    observaciones=f'Procesamiento completado en {ETAPA_KEY[STAGE_ORDER[i-1]]}',
                    fecha_hora=fecha,
                )

            if is_current and not (ld['status'] == 'completed' and stage_key == 'distribution'):
                # Inicio en etapa actual (sin finalizar)
                if i > 0:
                    MovimientoLote.objects.create(
                        lote=lote,
                        etapa_origen=self.etapas[ETAPA_KEY[STAGE_ORDER[i - 1]]],
                        etapa_destino=etapa_obj,
                        usuario=op_user,
                        tipo_movimiento='inicio',
                        observaciones=f'Inicio en {ETAPA_KEY[stage_key]}',
                        fecha_hora=fecha + timedelta(minutes=30),
                    )
                break

            fecha += timedelta(hours=durations_h[stage_key] + 1)
            etapa_ant = etapa_obj


    # ── Inspecciones de calidad ───────────────────────────────────────────────

    def _crear_inspecciones(self):
        self.stdout.write('\n🔍 Creando inspecciones de calidad...')
        for insp in INSPECCIONES:
            try:
                lote      = self.lotes[insp['lotCode']]
                etapa     = self.etapas[ETAPA_KEY[insp['stageKey']]]
                inspector = self.usuarios[insp['inspectorUsername']]
                cl        = insp['checklist']

                InspeccionCalidad.objects.create(
                    lote=lote,
                    etapa=etapa,
                    inspector=inspector,
                    estado_calidad=insp['status'],
                    grado_calidad=insp['grade'],
                    temperatura=insp['temperature'],
                    humedad=insp['humidity'],
                    peso_kg=insp['weight'],
                    humedad_correcta=cl['humedad'],
                    temperatura_correcta=cl['temperatura'],
                    peso_correcto=cl['peso'],
                    embalaje_correcto=cl['embalaje'],
                    etiquetado_correcto=cl['etiquetado'],
                    qr_legible=cl['qr'],
                    qr_verificado=cl['qr'],
                    decision=insp['decision'],
                    motivo_rechazo=insp['motivo_rechazo'],
                    observaciones=insp['notes'],
                    fecha_hora_inicio=_dt(insp['startTime']),
                    fecha_hora_fin=_dt(insp['endTime']),
                    duracion_minutos=insp['duration'],
                )
                self.stdout.write(self.style.SUCCESS(
                    f'   ✓ {insp["lotCode"]}  {insp["stageKey"]:15s}  {insp["status"]}'
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ✗ {insp["lotCode"]}: {e}'))

    # ── Eventos del sistema (desde mockActivities) ────────────────────────────

    def _crear_eventos(self):
        self.stdout.write('\n📅 Creando eventos del sistema...')
        for act in ACTIVIDADES:
            try:
                lote = self.lotes.get(act['lotCode'])
                user = self.usuarios.get(act['userUsername'])
                EventoSistema.objects.create(
                    tipo=act['type'],
                    usuario=user,
                    lote=lote,
                    descripcion=act['description'],
                    fecha_hora=_dt(act['date']),
                    ip_address='127.0.0.1',
                )
                self.stdout.write(self.style.SUCCESS(
                    f'   ✓ {act["lotCode"]}  {act["type"]}'
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ✗ {act["id"]}: {e}'))

    # ── Alertas ───────────────────────────────────────────────────────────────

    def _crear_alertas(self):
        self.stdout.write('\n🚨 Creando alertas...')
        for al in ALERTAS:
            try:
                lote  = self.lotes.get(al['lotCode']) if al['lotCode'] else None
                etapa = self.etapas.get(ETAPA_KEY.get(al.get('stageKey', ''), ''))
                fecha = _dt(al['fecha']) if 'fecha' in al else timezone.now()
                Alerta.objects.create(
                    lote=lote, etapa=etapa,
                    tipo=al['tipo'], severidad=al['severidad'],
                    estado=al['estado'], titulo=al['titulo'],
                    descripcion=al['descripcion'],
                    fecha_creacion=fecha,
                )
                code = al['lotCode'] or 'sistema'
                self.stdout.write(self.style.SUCCESS(f'   ✓ {code}  {al["tipo"]}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ✗ {al.get("lotCode")}: {e}'))

    # ── Notificaciones de ejemplo (notification-examples.ts) ─────────────────

    def _crear_notificaciones_ejemplo(self):
        self.stdout.write('\n🔔 Creando notificaciones de ejemplo...')
        for notif in NOTIFICACIONES_EJEMPLO:
            try:
                lote  = self.lotes.get(notif['lotCode']) if notif['lotCode'] else None
                etapa = self.etapas.get(ETAPA_KEY.get(notif.get('stageKey') or '', ''))
                fecha = _dt(notif['fecha'])
                Alerta.objects.create(
                    lote=lote, etapa=etapa,
                    tipo=notif['tipo'], severidad=notif['severidad'],
                    estado=notif['estado'], titulo=notif['titulo'],
                    descripcion=notif['descripcion'],
                    fecha_creacion=fecha,
                )
                code = notif['lotCode'] or 'sistema'
                self.stdout.write(self.style.SUCCESS(f'   ✓ {code:15s}  {notif["titulo"]}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ✗ {notif.get("titulo")}: {e}'))

    # ── Resumen ───────────────────────────────────────────────────────────────

    def _resumen(self):
        self.stdout.write('\n' + '=' * 65)
        self.stdout.write(self.style.SUCCESS('✅  MIGRACIÓN COMPLETADA'))
        self.stdout.write('=' * 65)
        self.stdout.write(f'  Usuarios:      {Usuario.objects.count()}')
        self.stdout.write(f'  Proveedores:   {Proveedor.objects.count()}')
        self.stdout.write(f'  Variedades:    {VariedadTabaco.objects.count()}')
        self.stdout.write(f'  Etapas:        {EtapaProductiva.objects.count()}')
        self.stdout.write(f'  Lotes:         {Lote.objects.count()}')
        self.stdout.write(f'    En producción: {Lote.objects.filter(estado="en_produccion").count()}')
        self.stdout.write(f'    Finalizados:   {Lote.objects.filter(estado="finalizado").count()}')
        self.stdout.write(f'  Movimientos:   {MovimientoLote.objects.count()}')
        self.stdout.write(f'  Inspecciones:  {InspeccionCalidad.objects.count()}')
        self.stdout.write(f'    Aprobadas:     {InspeccionCalidad.objects.filter(estado_calidad="aprobado").count()}')
        self.stdout.write(f'    Con obs:       {InspeccionCalidad.objects.filter(estado_calidad="aprobado_con_observaciones").count()}')
        self.stdout.write(f'    Rechazadas:    {InspeccionCalidad.objects.filter(estado_calidad="rechazado").count()}')
        self.stdout.write(f'  Alertas:       {Alerta.objects.count()}')
        self.stdout.write(f'    Activas:       {Alerta.objects.filter(estado="activa").count()}')
        self.stdout.write(f'    Resueltas:     {Alerta.objects.filter(estado="resuelta").count()}')
        self.stdout.write(f'  Eventos:       {EventoSistema.objects.count()}')
        self.stdout.write('\n  Credenciales:')
        for u in USUARIOS:
            self.stdout.write(f'    {u["username"]:25s}  →  {u["password"]}')
        self.stdout.write('\n  Frontend: http://localhost:3000')
        self.stdout.write('  Backend:  http://localhost:8000/api')
        self.stdout.write('=' * 65 + '\n')
