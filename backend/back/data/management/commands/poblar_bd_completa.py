"""
Management command para poblar la base de datos con datos realistas.
Crea proveedores, lotes, movimientos, inspecciones, alertas, y observaciones.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
import random
from data.models import (
    Proveedor, VariedadTabaco, EtapaProductiva, Lote, MovimientoLote,
    InspeccionCalidad, EvidenciaCalidad, Observacion, Alerta
)

Usuario = get_user_model()


class Command(BaseCommand):
    help = 'Pobla la base de datos con datos realistas de tabaquera'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Iniciando población de base de datos...'))
        
        # Verificar que existan usuarios
        if Usuario.objects.count() == 0:
            self.stdout.write(self.style.ERROR('⚠️  No hay usuarios. Ejecuta primero: python manage.py inicializar_datos'))
            return
        
        # Limpiar datos existentes (excepto usuarios)
        self.stdout.write('🗑️  Limpiando datos anteriores...')
        Alerta.objects.all().delete()
        Observacion.objects.all().delete()
        EvidenciaCalidad.objects.all().delete()
        InspeccionCalidad.objects.all().delete()
        MovimientoLote.objects.all().delete()
        Lote.objects.all().delete()
        Proveedor.objects.all().delete()
        
        # Crear datos
        self.crear_proveedores()
        self.crear_variedades()
        self.crear_etapas()
        self.crear_lotes_completos()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Base de datos poblada exitosamente!'))
        self.mostrar_resumen()

    def crear_proveedores(self):
        """Crea proveedores realistas de diferentes regiones"""
        self.stdout.write('\n📦 Creando proveedores...')
        
        proveedores_data = [
            {
                'nombre': 'Tabacalera San Pedro',
                'rfc': 'TSP850612HG4',
                'direccion': 'Carretera Federal 15, km 42, Nayarit',
                'telefono': '311-234-5678',
                'email': 'contacto@tabacalerasanpedro.mx',
            },
            {
                'nombre': 'Productores Unidos de Veracruz',
                'rfc': 'PUV920315KL2',
                'direccion': 'Avenida Independencia 234, Veracruz',
                'telefono': '229-987-6543',
                'email': 'ventas@puvtabaco.com.mx',
            },
            {
                'nombre': 'Hacienda El Cedro',
                'rfc': 'HEC780920MN8',
                'direccion': 'Rancho El Cedro, Chiapas',
                'telefono': '961-456-7890',
                'email': 'info@haciendaelcedro.mx',
            },
            {
                'nombre': 'Cooperativa Tabacalera del Valle',
                'rfc': 'CTV001205PQ3',
                'direccion': 'Km 18 Carretera Valle-Hermosillo, Sonora',
                'telefono': '662-345-8901',
                'email': 'cooperativa@tabacovalle.mx',
            },
            {
                'nombre': 'Tabacos Premium del Norte',
                'rfc': 'TPN150728RS5',
                'direccion': 'Boulevard Fundadores 567, Nuevo León',
                'telefono': '818-234-6789',
                'email': 'ventas@tabacospremium.com.mx',
            },
        ]
        
        self.proveedores = []
        for data in proveedores_data:
            proveedor = Proveedor.objects.create(**data, estado='activo')
            self.proveedores.append(proveedor)
            self.stdout.write(f'  ✓ {proveedor.nombre}')

    def crear_variedades(self):
        """Verifica o crea variedades de tabaco"""
        self.stdout.write('\n🌿 Verificando variedades de tabaco...')
        
        variedades_nombres = ['Burley', 'Virginia', 'Oriental', 'Perique', 'Latakia']
        self.variedades = []
        
        for nombre in variedades_nombres:
            variedad, created = VariedadTabaco.objects.get_or_create(
                nombre=nombre,
                defaults={'activo': True}
            )
            self.variedades.append(variedad)
            if created:
                self.stdout.write(f'  ✓ Creada: {nombre}')

    def crear_etapas(self):
        """Verifica que existan las etapas productivas"""
        self.stdout.write('\n⚙️  Verificando etapas productivas...')
        
        # Obtener etapas existentes ordenadas
        self.etapas = list(EtapaProductiva.objects.all().order_by('orden'))
        
        if len(self.etapas) == 0:
            self.stdout.write('  ⚠️  No hay etapas. Creando etapas básicas...')
            etapas_data = [
                ('Recepción', 1, 'Recepción y pesaje inicial del tabaco', 2),
                ('Primera clasificación', 2, 'Separación por calidad y tamaño', 4),
                ('Fermentación', 3, 'Proceso de fermentación controlada', 720),
                ('Curado', 4, 'Secado y curado del tabaco', 480),
                ('Segunda clasificación', 5, 'Clasificación final por grado', 6),
                ('Desvenado', 6, 'Remoción de venas centrales', 8),
                ('Empaque primario', 7, 'Empaque en bultos', 4),
                ('Control de calidad final', 8, 'Inspección final exhaustiva', 3),
                ('Almacenamiento', 9, 'Almacenamiento en condiciones controladas', 48),
                ('Despacho', 10, 'Preparación para envío', 2),
                ('Finalizado', 11, 'Proceso completado', 0),
            ]
            
            for nombre, orden, desc, horas in etapas_data:
                etapa = EtapaProductiva.objects.create(
                    nombre=nombre,
                    orden=orden,
                    descripcion=desc,
                    tiempo_esperado_horas=horas,
                    activa=True
                )
                self.etapas.append(etapa)
        else:
            self.stdout.write(f'  ✓ {len(self.etapas)} etapas encontradas')

    def crear_lotes_completos(self):
        """Crea lotes con todo su historial (movimientos, inspecciones, etc)"""
        self.stdout.write('\n📋 Creando lotes con historial completo...')
        
        # Verificar que haya suficientes etapas
        num_etapas = len(self.etapas)
        if num_etapas < 5:
            self.stdout.write(self.style.WARNING(f'  ⚠️  Solo hay {num_etapas} etapas. Se recomienda tener al menos 5.'))
            self.stdout.write('  Ejecuta: python manage.py inicializar_datos para crear todas las etapas.')
            return
        
        # Obtener usuarios
        admin = Usuario.objects.filter(rol='administrador').first()
        supervisores = list(Usuario.objects.filter(rol='supervisor'))
        operarios = list(Usuario.objects.filter(rol='operario'))
        calidad = list(Usuario.objects.filter(rol='control_calidad'))
        
        if not admin or not operarios or not calidad:
            self.stdout.write(self.style.ERROR('  ⚠️  No hay suficientes usuarios. Ejecuta: python manage.py inicializar_datos'))
            return
        
        # Configuración de lotes - ajustada al número de etapas disponibles
        max_etapa_idx = num_etapas - 1
        
        estados_lotes = [
            # Lotes completados (si hay etapa final)
            ('finalizado', min(max_etapa_idx, 10), 30),
            ('finalizado', min(max_etapa_idx, 10), 25),
            ('finalizado', min(max_etapa_idx, 10), 20),
            # Lotes en diferentes etapas
            ('en_produccion', min(4, max_etapa_idx), 0),
            ('en_produccion', min(3, max_etapa_idx), 0),
            ('en_produccion', min(2, max_etapa_idx), 0),
            ('en_produccion', min(4, max_etapa_idx), 1),
            ('en_produccion', min(3, max_etapa_idx), 2),
            ('en_produccion', min(2, max_etapa_idx), 0),
            ('en_produccion', min(1, max_etapa_idx), 0),
            ('en_espera', min(1, max_etapa_idx), 0),
            # Lotes recién ingresados
            ('pendiente', 0, 0),
            ('pendiente', 0, 0),
            ('pendiente', 0, 0),
            # Lote rechazado
            ('rechazado', min(2, max_etapa_idx), 5),
            # Más lotes en producción
            ('en_produccion', min(3, max_etapa_idx), 0),
            ('en_produccion', min(4, max_etapa_idx), 0),
            ('en_produccion', min(2, max_etapa_idx), 1),
            ('en_produccion', min(1, max_etapa_idx), 0),
            ('en_espera', min(2, max_etapa_idx), 0),
        ]
        
        for idx, (estado, etapa_idx, dias_atras) in enumerate(estados_lotes, 1):
            self.crear_lote_con_historial(
                numero=idx,
                estado=estado,
                etapa_idx=etapa_idx,
                dias_atras=dias_atras,
                admin=admin,
                supervisores=supervisores,
                operarios=operarios,
                calidad=calidad
            )

    def crear_lote_con_historial(self, numero, estado, etapa_idx, dias_atras, 
                                  admin, supervisores, operarios, calidad):
        """Crea un lote individual con todo su historial"""
        
        # Datos del lote
        proveedor = random.choice(self.proveedores)
        variedad = random.choice(self.variedades)
        peso_inicial = random.randint(400, 800)
        bultos = random.randint(15, 35)
        
        # Fecha de ingreso
        fecha_ingreso = timezone.now() - timedelta(days=dias_atras + random.randint(0, 5))
        
        # Crear lote
        codigo = f'LOT-2024-{numero:03d}'
        lote = Lote.objects.create(
            codigo=codigo,
            proveedor=proveedor,
            variedad=variedad,
            origen=self.obtener_origen_por_proveedor(proveedor),
            peso_inicial_kg=peso_inicial,
            peso_actual_kg=peso_inicial - random.randint(10, 50),
            cantidad_bultos=bultos,
            estado=estado,
            etapa_actual=self.etapas[etapa_idx] if etapa_idx > 0 else None,
            responsable_actual=random.choice(operarios) if estado == 'en_produccion' else None,
            fecha_ingreso=fecha_ingreso,
            fecha_inicio_produccion=fecha_ingreso + timedelta(hours=random.randint(1, 6)) if estado != 'pendiente' else None,
            fecha_finalizacion=fecha_ingreso + timedelta(days=45) if estado == 'finalizado' else None,
            observaciones_iniciales=self.generar_observacion_inicial(),
            creado_por=admin
        )
        
        self.stdout.write(f'  ✓ {codigo} - {estado} - {proveedor.nombre}')
        
        # Crear historial según el estado
        if estado != 'pendiente':
            self.crear_historial_lote(lote, etapa_idx, estado, operarios, calidad, supervisores)

    def crear_historial_lote(self, lote, etapa_actual_idx, estado, operarios, calidad, supervisores):
        """Crea movimientos, inspecciones y observaciones del lote"""
        
        fecha_actual = lote.fecha_ingreso
        
        # Crear movimientos y inspecciones por cada etapa hasta la actual
        etapas_a_crear = etapa_actual_idx if estado != 'rechazado' else 2
        
        for i in range(etapas_a_crear):
            etapa = self.etapas[i]
            operario = random.choice(operarios)
            
            # Movimiento de inicio de etapa
            fecha_actual += timedelta(hours=random.randint(1, 4))
            tiempo_trabajo = random.randint(30, 180)
            
            movimiento = MovimientoLote.objects.create(
                lote=lote,
                etapa_origen=self.etapas[i-1] if i > 0 else None,
                etapa_destino=etapa,
                usuario=operario,
                tipo_movimiento='inicio' if i == 0 else 'finalizacion',
                fecha_hora=fecha_actual,
                cantidad_procesada_kg=lote.peso_inicial_kg - random.randint(5, 15),
                tiempo_trabajo_minutos=tiempo_trabajo,
                incidencias=random.choice(['ninguna', 'ninguna', 'ninguna', 'humedad', 'retraso']),
                motivo_retraso='ninguno' if random.random() > 0.1 else random.choice(['personal', 'maquinaria']),
                observaciones=self.generar_observacion_movimiento() if random.random() > 0.7 else ''
            )
            
            # Inspección de calidad (50% de probabilidad o siempre en etapas críticas)
            if etapa.nombre in ['Recepción', 'Fermentación', 'Control de calidad final'] or random.random() > 0.5:
                fecha_actual += timedelta(hours=random.randint(1, 2))
                self.crear_inspeccion(lote, etapa, fecha_actual, random.choice(calidad), estado)
            
            # Observaciones aleatorias
            if random.random() > 0.6:
                fecha_actual += timedelta(hours=random.randint(1, 3))
                Observacion.objects.create(
                    lote=lote,
                    usuario=random.choice(operarios + calidad),
                    tipo=random.choice(['general', 'nota', 'incidencia']),
                    contenido=self.generar_observacion_proceso(),
                    fecha_hora=fecha_actual
                )
        
        # Crear alertas si aplica
        if estado == 'rechazado':
            self.crear_alerta_rechazo(lote)
        elif etapa_actual_idx >= 3 and random.random() > 0.7:
            self.crear_alerta_retraso(lote)

    def crear_inspeccion(self, lote, etapa, fecha, inspector, estado_lote):
        """Crea una inspección de calidad"""
        
        # Determinar estado de la inspección
        if estado_lote == 'rechazado' and etapa.orden <= 2:
            estado_insp = 'rechazado'
            decision = 'rechazar'
            grado = random.choice(['C', 'D'])
        else:
            estado_insp = random.choice(['aprobado', 'aprobado', 'aprobado_con_observaciones'])
            decision = 'aprobar'
            grado = random.choice(['A', 'A', 'B', 'B', 'C'])
        
        InspeccionCalidad.objects.create(
            lote=lote,
            etapa=etapa,
            inspector=inspector,
            estado_calidad=estado_insp,
            grado_calidad=grado,
            temperatura=random.uniform(18.0, 25.0),
            humedad=random.uniform(60.0, 75.0),
            peso_kg=lote.peso_actual_kg,
            humedad_correcta=random.choice([True, True, False]),
            temperatura_correcta=random.choice([True, True, True]),
            peso_correcto=True,
            embalaje_correcto=random.choice([True, True, True]),
            etiquetado_correcto=True,
            qr_legible=True,
            qr_verificado=True,
            decision=decision,
            motivo_rechazo='ninguno' if estado_insp != 'rechazado' else random.choice(['humedad_excesiva', 'danos_fisicos', 'contaminacion']),
            observaciones=self.generar_observacion_calidad() if random.random() > 0.5 else '',
            fecha_hora_inicio=fecha,
            fecha_hora_fin=fecha + timedelta(minutes=random.randint(30, 90)),
            duracion_minutos=random.randint(30, 90)
        )

    def crear_alerta_rechazo(self, lote):
        """Crea alerta de rechazo de calidad"""
        Alerta.objects.create(
            lote=lote,
            etapa=lote.etapa_actual,
            tipo='calidad_rechazada',
            severidad='critica',
            estado='activa',
            titulo=f'Lote {lote.codigo} rechazado en control de calidad',
            descripcion=f'El lote no cumple con los estándares de calidad requeridos. Proveedor: {lote.proveedor.nombre}',
            fecha_creacion=timezone.now()
        )

    def crear_alerta_retraso(self, lote):
        """Crea alerta de retraso"""
        Alerta.objects.create(
            lote=lote,
            etapa=lote.etapa_actual,
            tipo='retraso',
            severidad=random.choice(['media', 'alta']),
            estado='activa',
            titulo=f'Retraso detectado en lote {lote.codigo}',
            descripcion=f'El lote está tomando más tiempo del esperado en la etapa {lote.etapa_actual.nombre}',
            fecha_creacion=timezone.now()
        )

    def obtener_origen_por_proveedor(self, proveedor):
        """Retorna origen según proveedor"""
        origenes = {
            'Tabacalera San Pedro': 'Nayarit, México',
            'Productores Unidos de Veracruz': 'Veracruz, México',
            'Hacienda El Cedro': 'Chiapas, México',
            'Cooperativa Tabacalera del Valle': 'Sonora, México',
            'Tabacos Premium del Norte': 'Nuevo León, México',
        }
        return origenes.get(proveedor.nombre, 'México')

    def generar_observacion_inicial(self):
        """Genera observación inicial del lote"""
        observaciones = [
            'Lote recibido en buenas condiciones, empaque intacto',
            'Tabaco de buena calidad, color uniforme',
            'Material recibido según especificaciones del pedido',
            'Lote con características organolépticas adecuadas',
            'Empaque en condiciones óptimas, sin daños visibles',
            'Material libre de contaminantes visibles',
        ]
        return random.choice(observaciones)

    def generar_observacion_movimiento(self):
        """Genera observación de movimiento"""
        observaciones = [
            'Proceso completado sin incidencias',
            'Se observa buena evolución del material',
            'Temperatura y humedad dentro de parámetros',
            'Material procesado según protocolo estándar',
            'Condiciones ambientales controladas durante el proceso',
        ]
        return random.choice(observaciones)

    def generar_observacion_proceso(self):
        """Genera observación de proceso"""
        observaciones = [
            'El material muestra buena respuesta al proceso',
            'Color y textura dentro de lo esperado',
            'Se mantienen condiciones óptimas de procesamiento',
            'Lote evolucionando según lo planeado',
            'Sin anomalías detectadas en esta fase',
            'Material manteniendo características deseadas',
        ]
        return random.choice(observaciones)

    def generar_observacion_calidad(self):
        """Genera observación de calidad"""
        observaciones = [
            'Material cumple con especificaciones técnicas',
            'Características organolépticas satisfactorias',
            'Humedad y temperatura dentro de rangos aceptables',
            'Color y textura uniformes',
            'No se detectan contaminantes ni defectos significativos',
            'Material apto para continuar proceso',
        ]
        return random.choice(observaciones)

    def mostrar_resumen(self):
        """Muestra resumen de datos creados"""
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('📊 RESUMEN DE DATOS CREADOS'))
        self.stdout.write('='*60)
        
        self.stdout.write(f'\n👥 Usuarios: {Usuario.objects.count()}')
        self.stdout.write(f'   - Administradores: {Usuario.objects.filter(rol="administrador").count()}')
        self.stdout.write(f'   - Supervisores: {Usuario.objects.filter(rol="supervisor").count()}')
        self.stdout.write(f'   - Operarios: {Usuario.objects.filter(rol="operario").count()}')
        self.stdout.write(f'   - Control Calidad: {Usuario.objects.filter(rol="control_calidad").count()}')
        
        self.stdout.write(f'\n📦 Proveedores: {Proveedor.objects.count()}')
        self.stdout.write(f'🌿 Variedades: {VariedadTabaco.objects.count()}')
        self.stdout.write(f'⚙️  Etapas: {EtapaProductiva.objects.count()}')
        
        self.stdout.write(f'\n📋 Lotes: {Lote.objects.count()}')
        self.stdout.write(f'   - Pendientes: {Lote.objects.filter(estado="pendiente").count()}')
        self.stdout.write(f'   - En espera: {Lote.objects.filter(estado="en_espera").count()}')
        self.stdout.write(f'   - En producción: {Lote.objects.filter(estado="en_produccion").count()}')
        self.stdout.write(f'   - Finalizados: {Lote.objects.filter(estado="finalizado").count()}')
        self.stdout.write(f'   - Rechazados: {Lote.objects.filter(estado="rechazado").count()}')
        
        self.stdout.write(f'\n🔄 Movimientos: {MovimientoLote.objects.count()}')
        self.stdout.write(f'🔍 Inspecciones: {InspeccionCalidad.objects.count()}')
        self.stdout.write(f'   - Aprobadas: {InspeccionCalidad.objects.filter(estado_calidad="aprobado").count()}')
        self.stdout.write(f'   - Con observaciones: {InspeccionCalidad.objects.filter(estado_calidad="aprobado_con_observaciones").count()}')
        self.stdout.write(f'   - Rechazadas: {InspeccionCalidad.objects.filter(estado_calidad="rechazado").count()}')
        
        self.stdout.write(f'\n📝 Observaciones: {Observacion.objects.count()}')
        self.stdout.write(f'🚨 Alertas: {Alerta.objects.count()}')
        self.stdout.write(f'   - Activas: {Alerta.objects.filter(estado="activa").count()}')
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('\n✨ ¡Listo para usar!'))
        self.stdout.write('Accede al sistema en: http://localhost:3000')
        self.stdout.write('='*60 + '\n')
