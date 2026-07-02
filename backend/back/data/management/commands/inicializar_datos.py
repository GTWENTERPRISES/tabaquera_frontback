from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from data.models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva, Lote,
    MovimientoLote, InspeccionCalidad, Observacion, Alerta, EventoSistema
)


class Command(BaseCommand):
    help = 'Limpia la base de datos excepto usuarios y carga datos realistas'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando limpieza y carga de datos...'))
        
        self.stdout.write(self.style.WARNING('Limpiando base de datos excepto usuarios...'))
        self.clear_database()
        
        self.stdout.write('Verificando usuarios base...')
        self.ensure_users()
        
        self.stdout.write('Creando catálogos...')
        self.create_proveedores()
        self.create_variedades()
        self.create_etapas()
        
        self.stdout.write('Creando lotes y transacciones...')
        self.create_lotes()
        
        self.stdout.write('Creando alertas...')
        self.create_alertas()
        
        self.stdout.write('Creando eventos del sistema...')
        self.create_eventos()
        
        self.stdout.write(self.style.SUCCESS('¡Datos cargados exitosamente!'))
        self.mostrar_resumen()
        self.stdout.write(self.style.SUCCESS('\n=== CREDENCIALES DE ACCESO ==='))
        self.stdout.write(self.style.SUCCESS('Administrador: admin / admin123'))
        self.stdout.write(self.style.SUCCESS('Supervisor: supervisor / supervisor123'))
        self.stdout.write(self.style.SUCCESS('Operario Recepción: operario1 / operario123'))
        self.stdout.write(self.style.SUCCESS('Operario Clasificación: operario2 / operario123'))
        self.stdout.write(self.style.SUCCESS('Operario Selección: operario3 / operario123'))
        self.stdout.write(self.style.SUCCESS('Operario Empaque: operario4 / operario123'))
        self.stdout.write(self.style.SUCCESS('Control Calidad: calidad / calidad123'))

    def clear_database(self):
        MovimientoLote.objects.all().delete()
        InspeccionCalidad.objects.all().delete()
        Observacion.objects.all().delete()
        Alerta.objects.all().delete()
        EventoSistema.objects.all().delete()
        Lote.objects.all().delete()
        Proveedor.objects.all().delete()
        VariedadTabaco.objects.all().delete()
        EtapaProductiva.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('OK: Base de datos limpia'))

    def ensure_users(self):
        admin, created = Usuario.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@goldenleaf.com',
                'nombres': 'Carlos',
                'apellidos': 'Administrador',
                'telefono': '5551234567',
                'rol': Usuario.Rol.ADMINISTRADOR,
                'departamento': Usuario.Departamento.ADMINISTRACION,
                'estado': Usuario.Estado.ACTIVO,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created or admin.password != 'pbkdf2_sha256$870000$':
            admin.set_password('admin123')
            admin.save()

        supervisor, created = Usuario.objects.get_or_create(
            username='supervisor',
            defaults={
                'email': 'supervisor@goldenleaf.com',
                'nombres': 'María',
                'apellidos': 'Supervisor',
                'telefono': '5551234568',
                'rol': Usuario.Rol.SUPERVISOR,
                'departamento': Usuario.Departamento.PRODUCCION,
                'estado': Usuario.Estado.ACTIVO,
            }
        )
        if created or supervisor.password != 'pbkdf2_sha256$870000$':
            supervisor.set_password('supervisor123')
            supervisor.save()

        operario1, created = Usuario.objects.get_or_create(
            username='operario1',
            defaults={
                'email': 'operario1@goldenleaf.com',
                'nombres': 'Juan',
                'apellidos': 'Pérez',
                'telefono': '5551234569',
                'rol': Usuario.Rol.OPERARIO,
                'departamento': Usuario.Departamento.RECEPCION,
                'estado': Usuario.Estado.ACTIVO,
            }
        )
        if created or operario1.password != 'pbkdf2_sha256$870000$':
            operario1.set_password('operario123')
            operario1.save()

        operario2, created = Usuario.objects.get_or_create(
            username='operario2',
            defaults={
                'email': 'operario2@goldenleaf.com',
                'nombres': 'Pedro',
                'apellidos': 'López',
                'telefono': '5551234570',
                'rol': Usuario.Rol.OPERARIO,
                'departamento': Usuario.Departamento.CLASIFICACION,
                'estado': Usuario.Estado.ACTIVO,
            }
        )
        if created or operario2.password != 'pbkdf2_sha256$870000$':
            operario2.set_password('operario123')
            operario2.save()

        operario3, created = Usuario.objects.get_or_create(
            username='operario3',
            defaults={
                'email': 'operario3@goldenleaf.com',
                'nombres': 'Luis',
                'apellidos': 'García',
                'telefono': '5551234571',
                'rol': Usuario.Rol.OPERARIO,
                'departamento': Usuario.Departamento.SELECCION,
                'estado': Usuario.Estado.ACTIVO,
            }
        )
        if created or operario3.password != 'pbkdf2_sha256$870000$':
            operario3.set_password('operario123')
            operario3.save()

        operario4, created = Usuario.objects.get_or_create(
            username='operario4',
            defaults={
                'email': 'operario4@goldenleaf.com',
                'nombres': 'Roberto',
                'apellidos': 'González',
                'telefono': '5551234573',
                'rol': Usuario.Rol.OPERARIO,
                'departamento': Usuario.Departamento.EMPAQUE,
                'estado': Usuario.Estado.ACTIVO,
            }
        )
        if created or operario4.password != 'pbkdf2_sha256$870000$':
            operario4.set_password('operario123')
            operario4.save()

        calidad, created = Usuario.objects.get_or_create(
            username='calidad',
            defaults={
                'email': 'calidad@goldenleaf.com',
                'nombres': 'Ana',
                'apellidos': 'Martínez',
                'telefono': '5551234572',
                'rol': Usuario.Rol.CONTROL_CALIDAD,
                'departamento': Usuario.Departamento.CALIDAD,
                'estado': Usuario.Estado.ACTIVO,
            }
        )
        if created or calidad.password != 'pbkdf2_sha256$870000$':
            calidad.set_password('calidad123')
            calidad.save()

    def create_proveedores(self):
        proveedores_data = [
            {
                'nombre': 'Tabacalera del Sur S.A. de C.V.',
                'rfc': 'TDS950101ABC',
                'direccion': 'Av. Revolución 1234, Col. Centro, Tepic, Nayarit',
                'telefono': '3111234567',
                'email': 'contacto@tabacalsur.com.mx',
                'estado': Proveedor.Estado.ACTIVO
            },
            {
                'nombre': 'Productores Unidos de Tabaco de Veracruz',
                'rfc': 'PUT850215DEF',
                'direccion': 'Calle del Tabaco 567, Col. Industrial, Xalapa, Veracruz',
                'telefono': '2291234568',
                'email': 'ventas@productoresunidos.com',
                'estado': Proveedor.Estado.ACTIVO
            },
            {
                'nombre': 'Agroindustrias del Pacífico S.A.',
                'rfc': 'ADP920330GHI',
                'direccion': 'Carretera Culiacán-Mazatlán 789, Col. Agrícola, Culiacán, Sinaloa',
                'telefono': '6671234569',
                'email': 'info@agropacifico.mx',
                'estado': Proveedor.Estado.ACTIVO
            },
            {
                'nombre': 'Tabaco Premium de Chiapas',
                'rfc': 'TPM880420JKL',
                'direccion': 'Boulevard Belisario Domínguez 321, Col. Centro, Tuxtla Gutiérrez, Chiapas',
                'telefono': '9611234570',
                'email': 'ventas@tabacopremium.mx',
                'estado': Proveedor.Estado.ACTIVO
            },
            {
                'nombre': 'Habanos de Yucatán S.A.',
                'rfc': 'HYU000101XYZ',
                'direccion': 'Calle 60 234, Col. Centro, Mérida, Yucatán',
                'telefono': '9991234571',
                'email': 'contacto@habanosyucatan.com',
                'estado': Proveedor.Estado.ACTIVO
            },
        ]
        for data in proveedores_data:
            Proveedor.objects.get_or_create(nombre=data['nombre'], defaults=data)
        self.stdout.write(self.style.SUCCESS(f'OK: {Proveedor.objects.count()} proveedores creados'))

    def create_variedades(self):
        variedades_data = [
            {
                'nombre': 'Virginia',
                'descripcion': 'Variedad suave, alta en azúcar, ideal para cigarrillos',
                'caracteristicas': 'Color dorado claro, secado al aire caliente, aroma dulce y floral',
                'activo': True
            },
            {
                'nombre': 'Burley',
                'descripcion': 'Cuerpo medio, bajo en azúcar, excelente para mezclas',
                'caracteristicas': 'Color marrón claro, secado al aire, sabor neutro y terroso',
                'activo': True
            },
            {
                'nombre': 'Oriental',
                'descripcion': 'Variedad aromática, hojas pequeñas, para puros y mezclas premium',
                'caracteristicas': 'Altamente aromático, secado al sol, sabor especiado y herbáceo',
                'activo': True
            },
            {
                'nombre': 'Habano',
                'descripcion': 'Variedad premium para puros, sabor intenso y complejo',
                'caracteristicas': 'Color marrón oscuro, fermentación especial, sabor rico y picante',
                'activo': True
            },
            {
                'nombre': 'Criollo',
                'descripcion': 'Variedad tradicional mexicana, adaptada a climas tropicales',
                'caracteristicas': 'Color rojizo, secado al aire, sabor característico local',
                'activo': True
            },
            {
                'nombre': 'Kentucky',
                'descripcion': 'Variedad robusta, alto contenido de nicotina, para tabaco de pipa',
                'caracteristicas': 'Color oscuro, secado al fuego, sabor fuerte y ahumado',
                'activo': True
            },
        ]
        for data in variedades_data:
            VariedadTabaco.objects.get_or_create(nombre=data['nombre'], defaults=data)
        self.stdout.write(self.style.SUCCESS(f'OK: {VariedadTabaco.objects.count()} variedades creadas'))

    def create_etapas(self):
        etapas_data = [
            {
                'nombre': 'Recepción',
                'orden': 1,
                'descripcion': 'Recepción, verificación y pesaje inicial del lote',
                'tiempo_esperado_horas': 2.0,
                'activa': True
            },
            {
                'nombre': 'Clasificación',
                'orden': 2,
                'descripcion': 'Clasificación por tamaño, color y calidad visual',
                'tiempo_esperado_horas': 8.0,
                'activa': True
            },
            {
                'nombre': 'Selección',
                'orden': 3,
                'descripcion': 'Selección manual de hojas según estándares de calidad',
                'tiempo_esperado_horas': 12.0,
                'activa': True
            },
            {
                'nombre': 'Empaque',
                'orden': 4,
                'descripcion': 'Empaque, etiquetado y preparación para distribución',
                'tiempo_esperado_horas': 4.0,
                'activa': True
            },
            {
                'nombre': 'Distribución',
                'orden': 5,
                'descripcion': 'Almacenamiento final y preparación para envío',
                'tiempo_esperado_horas': 2.0,
                'activa': True
            },
        ]
        for data in etapas_data:
            EtapaProductiva.objects.get_or_create(nombre=data['nombre'], defaults=data)
        self.stdout.write(self.style.SUCCESS(f'OK: {EtapaProductiva.objects.count()} etapas creadas'))

    def create_lotes(self):
        proveedores = list(Proveedor.objects.all())
        variedades = list(VariedadTabaco.objects.all())
        etapas = list(EtapaProductiva.objects.order_by('orden'))
        usuarios = list(Usuario.objects.filter(rol__in=[Usuario.Rol.OPERARIO, Usuario.Rol.CONTROL_CALIDAD, Usuario.Rol.SUPERVISOR]))
        supervisor = Usuario.objects.filter(rol=Usuario.Rol.SUPERVISOR).first()
        calidad_user = Usuario.objects.filter(rol=Usuario.Rol.CONTROL_CALIDAD).first()
        operarios = list(Usuario.objects.filter(rol=Usuario.Rol.OPERARIO))

        # Lotes completos, en producción, pendientes, rechazados, en espera
        lotes_config = [
            {'codigo': 'LT-2026-001', 'origen': 'Tepic, Nayarit', 'peso': 500, 'bultos': 10, 'estado': Lote.Estado.FINALIZADO, 'etapa_idx': 4, 'dias_atras': 15},
            {'codigo': 'LT-2026-002', 'origen': 'Xalapa, Veracruz', 'peso': 750, 'bultos': 15, 'estado': Lote.Estado.EN_PRODUCCION, 'etapa_idx': 2, 'dias_atras': 10},
            {'codigo': 'LT-2026-003', 'origen': 'Culiacán, Sinaloa', 'peso': 600, 'bultos': 12, 'estado': Lote.Estado.EN_PRODUCCION, 'etapa_idx': 3, 'dias_atras': 8},
            {'codigo': 'LT-2026-004', 'origen': 'Tuxtla Gutiérrez, Chiapas', 'peso': 400, 'bultos': 8, 'estado': Lote.Estado.RECHAZADO, 'etapa_idx': 1, 'dias_atras': 5},
            {'codigo': 'LT-2026-005', 'origen': 'Mérida, Yucatán', 'peso': 300, 'bultos': 6, 'estado': Lote.Estado.PENDIENTE, 'etapa_idx': 0, 'dias_atras': 3},
            {'codigo': 'LT-2026-006', 'origen': 'Nayarit', 'peso': 550, 'bultos': 11, 'estado': Lote.Estado.EN_PRODUCCION, 'etapa_idx': 1, 'dias_atras': 2},
            {'codigo': 'LT-2026-007', 'origen': 'Veracruz', 'peso': 680, 'bultos': 14, 'estado': Lote.Estado.FINALIZADO, 'etapa_idx': 4, 'dias_atras': 20},
            {'codigo': 'LT-2026-008', 'origen': 'Sinaloa', 'peso': 420, 'bultos': 9, 'estado': Lote.Estado.PENDIENTE, 'etapa_idx': 0, 'dias_atras': 1},
            {'codigo': 'LT-2026-009', 'origen': 'Chiapas', 'peso': 480, 'bultos': 10, 'estado': Lote.Estado.EN_PRODUCCION, 'etapa_idx': 2, 'dias_atras': 7},
            {'codigo': 'LT-2026-010', 'origen': 'Yucatán', 'peso': 580, 'bultos': 13, 'estado': Lote.Estado.FINALIZADO, 'etapa_idx': 4, 'dias_atras': 18},
            {'codigo': 'LT-2026-011', 'origen': 'Tepic, Nayarit', 'peso': 620, 'bultos': 14, 'estado': Lote.Estado.EN_PRODUCCION, 'etapa_idx': 3, 'dias_atras': 6},
            {'codigo': 'LT-2026-012', 'origen': 'Xalapa, Veracruz', 'peso': 380, 'bultos': 8, 'estado': Lote.Estado.EN_ESPERA, 'etapa_idx': 2, 'dias_atras': 4},
            {'codigo': 'LT-2026-013', 'origen': 'Culiacán, Sinaloa', 'peso': 520, 'bultos': 11, 'estado': Lote.Estado.EN_PRODUCCION, 'etapa_idx': 1, 'dias_atras': 1},
            {'codigo': 'LT-2026-014', 'origen': 'Tuxtla Gutiérrez, Chiapas', 'peso': 450, 'bultos': 9, 'estado': Lote.Estado.FINALIZADO, 'etapa_idx': 4, 'dias_atras': 25},
            {'codigo': 'LT-2026-015', 'origen': 'Mérida, Yucatán', 'peso': 350, 'bultos': 7, 'estado': Lote.Estado.PENDIENTE, 'etapa_idx': 0, 'dias_atras': 0},
        ]

        for idx, config in enumerate(lotes_config):
            proveedor = proveedores[idx % len(proveedores)]
            variedad = variedades[idx % len(variedades)]
            etapa_actual = etapas[config['etapa_idx']] if config['etapa_idx'] < len(etapas) else None
            responsable = operarios[idx % len(operarios)] if config['estado'] == Lote.Estado.EN_PRODUCCION else None
            fecha_ingreso = timezone.now() - timedelta(days=config['dias_atras'])
            fecha_inicio_produccion = fecha_ingreso + timedelta(hours=4) if config['estado'] != Lote.Estado.PENDIENTE else None
            fecha_finalizacion = fecha_ingreso + timedelta(days=config['dias_atras'] - 1) if config['estado'] == Lote.Estado.FINALIZADO else None

            # Crear lote
            lote = Lote.objects.create(
                codigo=config['codigo'],
                codigo_qr=f'QR-{config["codigo"]}',
                proveedor=proveedor,
                variedad=variedad,
                origen=config['origen'],
                peso_inicial_kg=config['peso'],
                peso_actual_kg=config['peso'] - (idx * 3),
                cantidad_bultos=config['bultos'],
                estado=config['estado'],
                etapa_actual=etapa_actual,
                responsable_actual=responsable,
                fecha_ingreso=fecha_ingreso,
                fecha_inicio_produccion=fecha_inicio_produccion,
                fecha_finalizacion=fecha_finalizacion,
                observaciones_iniciales=f'Lote de {variedad.nombre} desde {config["origen"]} - Calidad esperada {random.choice(["A", "B", "C"])}',
                creado_por=supervisor
            )

            # Crear movimientos según el estado del lote
            if config['estado'] != Lote.Estado.PENDIENTE:
                # Movimiento inicial
                MovimientoLote.objects.create(
                    lote=lote,
                    etapa_destino=etapas[0],
                    usuario=supervisor,
                    tipo_movimiento=MovimientoLote.TipoMovimiento.INICIO,
                    observaciones='Ingreso inicial y verificación del lote',
                    fecha_hora=fecha_ingreso + timedelta(hours=1)
                )

                # Movimientos intermedios por cada etapa completada
                for etapa_idx in range(config['etapa_idx']):
                    if etapa_idx < len(etapas) - 1:
                        etapa_origen = etapas[etapa_idx]
                        etapa_destino = etapas[etapa_idx + 1]
                        usuario_mov = operarios[etapa_idx % len(operarios)]
                        horas_pasadas = (config['dias_atras'] - etapa_idx) * 24 - etapa_idx * 4
                        
                        # Agregar pausa y reanudación para lotes más avanzados
                        if etapa_idx > 0 and random.random() > 0.5:
                            MovimientoLote.objects.create(
                                lote=lote,
                                etapa_destino=etapa_origen,
                                usuario=usuario_mov,
                                tipo_movimiento=MovimientoLote.TipoMovimiento.PAUSA,
                                observaciones='Pausa para cambio de turno',
                                fecha_hora=fecha_ingreso + timedelta(hours=horas_pasadas + 2),
                                tiempo_pausa_minutos=random.randint(30, 90)
                            )
                            MovimientoLote.objects.create(
                                lote=lote,
                                etapa_destino=etapa_origen,
                                usuario=usuario_mov,
                                tipo_movimiento=MovimientoLote.TipoMovimiento.REANUDACION,
                                observaciones='Reanudación del proceso',
                                fecha_hora=fecha_ingreso + timedelta(hours=horas_pasadas + 4)
                            )
                        
                        # Finalizar etapa
                        MovimientoLote.objects.create(
                            lote=lote,
                            etapa_origen=etapa_origen,
                            etapa_destino=etapa_destino,
                            usuario=usuario_mov,
                            tipo_movimiento=MovimientoLote.TipoMovimiento.FINALIZACION,
                            cantidad_procesada_kg=config['peso'] - (etapa_idx * 2),
                            tiempo_trabajo_minutos=random.randint(240, 720),
                            incidencias=random.choice(['ninguna', 'ninguna', 'ninguna', 'humedad', 'retraso']),
                            motivo_retraso=random.choice(['ninguno', 'personal', 'maquinaria']) if random.random() > 0.7 else 'ninguno',
                            observaciones=f'Proceso completado en {etapa_origen.nombre} - {random.choice(["Excelente calidad", "Buena calidad", "Calidad aceptable"])}',
                            fecha_hora=fecha_ingreso + timedelta(hours=horas_pasadas)
                        )

            # Crear inspecciones de calidad para lotes completados o en producción
            if (config['estado'] in [Lote.Estado.FINALIZADO, Lote.Estado.EN_PRODUCCION]) and calidad_user and etapa_actual:
                # Una inspección para cada etapa completada
                for etapa_idx in range(config['etapa_idx'] + 1):
                    etapa_inspeccion = etapas[etapa_idx] if etapa_idx < len(etapas) else etapa_actual
                    
                    if config['estado'] == Lote.Estado.RECHAZADO and etapa_idx == 1:
                        estado_inspeccion = InspeccionCalidad.EstadoCalidad.RECHAZADO
                        grado = 'D'
                        decision = 'rechazar'
                    elif config['estado'] == Lote.Estado.FINALIZADO:
                        estado_inspeccion = InspeccionCalidad.EstadoCalidad.APROBADO
                        grado = random.choice(['A', 'B'])
                        decision = 'aprobar'
                    else:
                        estado_inspeccion = random.choice([
                            InspeccionCalidad.EstadoCalidad.APROBADO,
                            InspeccionCalidad.EstadoCalidad.APROBADO_CON_OBSERVACIONES
                        ])
                        grado = random.choice(['A', 'B', 'C'])
                        decision = 'aprobar'

                    fecha_inicio = fecha_ingreso + timedelta(days=etapa_idx, hours=6)
                    fecha_fin = fecha_inicio + timedelta(minutes=random.randint(45, 120))
                    
                    InspeccionCalidad.objects.create(
                        lote=lote,
                        etapa=etapa_inspeccion,
                        inspector=calidad_user,
                        estado_calidad=estado_inspeccion,
                        grado_calidad=grado,
                        temperatura=round(random.uniform(20.0, 26.0), 2),
                        humedad=round(random.uniform(60.0, 70.0), 2),
                        peso_kg=config['peso'] - (etapa_idx * 2),
                        humedad_correcta=random.choice([True, True, False]),
                        temperatura_correcta=random.choice([True, True, True]),
                        peso_correcto=True,
                        embalaje_correcto=random.choice([True, True, True]),
                        etiquetado_correcto=True,
                        qr_legible=True,
                        qr_verificado=True,
                        decision=decision,
                        motivo_rechazo=random.choice(['humedad_excesiva', 'danos_fisicos', 'contaminacion', 'ninguno']) if estado_inspeccion == 'rechazado' else 'ninguno',
                        observaciones=f'Inspección en {etapa_inspeccion.nombre} - {random.choice(["Todo dentro de especificaciones", "Pequeñas variaciones aceptables", "Calidad excelente"])}' if estado_inspeccion != 'rechazado' else 'Calidad no cumple con estándares - Humedad excesiva',
                        fecha_hora_inicio=fecha_inicio,
                        fecha_hora_fin=fecha_fin,
                        duracion_minutos=int((fecha_fin - fecha_inicio).total_seconds() / 60)
                    )

            # Crear observaciones para el lote
            for obs_idx in range(random.randint(1, 3)):
                Observacion.objects.create(
                    lote=lote,
                    usuario=responsable if responsable else supervisor,
                    tipo=random.choice([Observacion.TipoObservacion.NOTA, Observacion.TipoObservacion.GENERAL, Observacion.TipoObservacion.GENERAL]),
                    contenido=random.choice([
                        f'Lote {config["codigo"]} progresa normal.',
                        f'Material en buenas condiciones.',
                        f'Temperatura y humedad controladas.',
                        f'Sin anomalías detectadas.',
                        f'{variedad.nombre} con características óptimas.'
                    ]),
                    fecha_hora=fecha_ingreso + timedelta(days=obs_idx + 1, hours=random.randint(2, 20))
                )

        self.stdout.write(self.style.SUCCESS(f'OK: {Lote.objects.count()} lotes creados'))

    def create_alertas(self):
        lotes = list(Lote.objects.all())
        etapas = list(EtapaProductiva.objects.all())
        supervisor = Usuario.objects.filter(rol=Usuario.Rol.SUPERVISOR).first()
        calidad_user = Usuario.objects.filter(rol=Usuario.Rol.CONTROL_CALIDAD).first()

        # Alertas de retraso para lotes en producción
        lotes_en_produccion = [l for l in lotes if l.estado == Lote.Estado.EN_PRODUCCION]
        for idx, lote in enumerate(lotes_en_produccion[:2]):
            Alerta.objects.create(
                lote=lote,
                etapa=lote.etapa_actual,
                tipo=Alerta.TipoAlerta.RETRASO,
                severidad=Alerta.SeveridadAlerta.MEDIA if idx == 0 else Alerta.SeveridadAlerta.ALTA,
                estado=Alerta.EstadoAlerta.ACTIVA,
                titulo=f'Retraso detectado en lote {lote.codigo}',
                descripcion=f'El lote está tomando más tiempo del esperado en la etapa {lote.etapa_actual.nombre}. Tiempo transcurrido: {random.randint(12, 24)}h',
                fecha_creacion=timezone.now() - timedelta(hours=idx * 6)
            )

        # Alerta de calidad rechazada
        lote_rechazado = [l for l in lotes if l.estado == Lote.Estado.RECHAZADO][0] if [l for l in lotes if l.estado == Lote.Estado.RECHAZADO] else None
        if lote_rechazado:
            Alerta.objects.create(
                lote=lote_rechazado,
                etapa=lote_rechazado.etapa_actual,
                tipo=Alerta.TipoAlerta.CALIDAD_RECHAZADA,
                severidad=Alerta.SeveridadAlerta.CRITICA,
                estado=Alerta.EstadoAlerta.ACTIVA,
                titulo=f'Lote {lote_rechazado.codigo} rechazado en control de calidad',
                descripcion=f'El lote no cumple con los estándares de calidad requeridos. Proveedor: {lote_rechazado.proveedor.nombre}. Motivo: Humedad excesiva.',
                fecha_creacion=timezone.now() - timedelta(days=1)
            )

        # Alerta de cuello de botella
        lote_cuello = [l for l in lotes if l.etapa_actual and l.etapa_actual.nombre == 'Selección'][0] if [l for l in lotes if l.etapa_actual and l.etapa_actual.nombre == 'Selección'] else None
        if lote_cuello:
            Alerta.objects.create(
                lote=lote_cuello,
                etapa=lote_cuello.etapa_actual,
                tipo=Alerta.TipoAlerta.CUELLO_BOTELLA,
                severidad=Alerta.SeveridadAlerta.ALTA,
                estado=Alerta.EstadoAlerta.ACTIVA,
                titulo='Cuello de botella detectado en Selección',
                descripcion='3 lotes acumulados esperando selección. Se recomienda asignar personal adicional.',
                fecha_creacion=timezone.now() - timedelta(hours=4)
            )

        # Alertas de sistema resueltas
        Alerta.objects.create(
            lote=None,
            etapa=None,
            tipo=Alerta.TipoAlerta.SISTEMA,
            severidad=Alerta.SeveridadAlerta.BAJA,
            estado=Alerta.EstadoAlerta.RESUELTA,
            titulo='Mantenimiento programado completado',
            descripcion='El mantenimiento semanal del sistema se completó exitosamente. Todos los servicios están funcionando correctamente.',
            fecha_creacion=timezone.now() - timedelta(days=2),
            fecha_resolucion=timezone.now() - timedelta(days=2, hours=2),
            resuelto_por=supervisor
        )
        Alerta.objects.create(
            lote=None,
            etapa=None,
            tipo=Alerta.TipoAlerta.SISTEMA,
            severidad=Alerta.SeveridadAlerta.BAJA,
            estado=Alerta.EstadoAlerta.RESUELTA,
            titulo='Backup completado',
            descripcion='Backup diario de la base de datos completado exitosamente.',
            fecha_creacion=timezone.now() - timedelta(days=1),
            fecha_resolucion=timezone.now() - timedelta(days=1, hours=1),
            resuelto_por=supervisor
        )

        self.stdout.write(self.style.SUCCESS(f'OK: {Alerta.objects.count()} alertas creadas'))

    def create_eventos(self):
        lotes = list(Lote.objects.all())
        usuarios = list(Usuario.objects.all())
        admin = Usuario.objects.filter(rol=Usuario.Rol.ADMINISTRADOR).first()
        supervisor = Usuario.objects.filter(rol=Usuario.Rol.SUPERVISOR).first()
        calidad_user = Usuario.objects.filter(rol=Usuario.Rol.CONTROL_CALIDAD).first()

        eventos = []

        # Eventos de creación de lotes
        for lote in lotes[:5]:
            eventos.append({
                'tipo': EventoSistema.TipoEvento.CREACION_LOTE,
                'usuario': admin,
                'lote': lote,
                'descripcion': f'Lote {lote.codigo} creado por {admin.nombre_completo}',
                'datos_adicionales': {'codigo': lote.codigo, 'proveedor': lote.proveedor.nombre},
                'fecha_hora': lote.fecha_ingreso,
                'ip_address': '192.168.1.100'
            })

        # Eventos de movimiento de etapa
        lotes_en_produccion = [l for l in lotes if l.estado == Lote.Estado.EN_PRODUCCION]
        for idx, lote in enumerate(lotes_en_produccion[:4]):
            if lote.etapa_actual:
                eventos.append({
                    'tipo': EventoSistema.TipoEvento.MOVIMIENTO_ETAPA,
                    'usuario': lote.responsable_actual if lote.responsable_actual else supervisor,
                    'lote': lote,
                    'descripcion': f'Lote {lote.codigo} movido a etapa {lote.etapa_actual.nombre}',
                    'datos_adicionales': {'etapa': lote.etapa_actual.nombre},
                    'fecha_hora': timezone.now() - timedelta(hours=4 + idx * 2),
                    'ip_address': f'192.168.1.{101 + idx}'
                })

        # Eventos de inspección de calidad
        if calidad_user:
            for idx, lote in enumerate(lotes[:4]):
                eventos.append({
                    'tipo': EventoSistema.TipoEvento.INSPECCION_CALIDAD,
                    'usuario': calidad_user,
                    'lote': lote,
                    'descripcion': f'Inspección de calidad realizada para lote {lote.codigo}',
                    'datos_adicionales': {'estado': 'Completada'},
                    'fecha_hora': timezone.now() - timedelta(hours=6 + idx * 3),
                    'ip_address': '192.168.1.102'
                })

        # Eventos de login
        for idx, usuario in enumerate(usuarios[:6]):
            eventos.append({
                'tipo': EventoSistema.TipoEvento.LOGIN,
                'usuario': usuario,
                'lote': None,
                'descripcion': f'Inicio de sesión de {usuario.nombre_completo}',
                'datos_adicionales': {'username': usuario.username},
                'fecha_hora': timezone.now() - timedelta(hours=random.randint(1, 48)),
                'ip_address': f'192.168.1.{103 + idx}'
            })

        # Eventos de cambio de estado
        lotes_finalizados = [l for l in lotes if l.estado == Lote.Estado.FINALIZADO]
        for idx, lote in enumerate(lotes_finalizados[:2]):
            eventos.append({
                'tipo': EventoSistema.TipoEvento.CAMBIO_ESTADO_LOTE,
                'usuario': supervisor,
                'lote': lote,
                'descripcion': f'Lote {lote.codigo} marcado como finalizado',
                'datos_adicionales': {'estado_anterior': 'en_produccion', 'estado_nuevo': 'finalizado'},
                'fecha_hora': lote.fecha_finalizacion,
                'ip_address': '192.168.1.100'
            })

        # Eventos de alerta generada
        alertas = list(Alerta.objects.all())
        for idx, alerta in enumerate(alertas[:3]):
            eventos.append({
                'tipo': EventoSistema.TipoEvento.ALERTA_GENERADA,
                'usuario': supervisor,
                'lote': alerta.lote,
                'descripcion': f'Alerta generada: {alerta.titulo}',
                'datos_adicionales': {'tipo_alerta': alerta.tipo, 'severidad': alerta.severidad},
                'fecha_hora': alerta.fecha_creacion,
                'ip_address': '192.168.1.100'
            })

        # Crear todos los eventos
        for data in eventos:
            EventoSistema.objects.create(**data)

        self.stdout.write(self.style.SUCCESS(f'OK: {EventoSistema.objects.count()} eventos creados'))

    def mostrar_resumen(self):
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('📊 RESUMEN DE DATOS CREADOS'))
        self.stdout.write('=' * 60)
        
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
        self.stdout.write(f'📝 Observaciones: {Observacion.objects.count()}')
        self.stdout.write(f'🚨 Alertas: {Alerta.objects.count()}')
        self.stdout.write(f'   - Activas: {Alerta.objects.filter(estado="activa").count()}')
        self.stdout.write(f'   - Resueltas: {Alerta.objects.filter(estado="resuelta").count()}')
        self.stdout.write(f'📋 Eventos: {EventoSistema.objects.count()}')
        
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('\n✨ ¡Listo para usar!'))
        self.stdout.write('=' * 60 + '\n')
