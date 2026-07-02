from django.core.management.base import BaseCommand
from django.utils import timezone
from data.models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva, Lote,
    MovimientoLote
)
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Migra datos desde los mocks del frontend a Django'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando migración de datos desde frontend...'))
        
        # Limpiar datos existentes (excepto usuarios del sistema)
        self.stdout.write('Limpiando lotes existentes...')
        Lote.objects.all().delete()
        
        # Mapeo de variedades del frontend a Django
        variedades_map = {
            'Corojo': 'Virginia',
            'Habano': 'Habano',
            'Connecticut': 'Burley',
            'Criollo': 'Criollo',
            'Maduro': 'Oriental',
            'Sumatra': 'Virginia',
        }
        
        # Mapeo de proveedores del frontend a Django
        proveedores_map = {
            'Tabacalera del Norte': 'Tabacalera del Sur S.A.',
            'Hojas Selectas S.A.': 'Productores Unidos de Tabaco',
            'Tabacos Premium': 'Agroindustrias del Pacífico',
            'Cultivos del Valle': 'Tabaco Premium de México',
            'Golden Fields': 'Tabacalera del Sur S.A.',
            'Plantaciones del Sur': 'Productores Unidos de Tabaco',
        }
        
        # Mapeo de etapas del frontend a Django
        etapas_map = {
            'reception': 'Recepción',
            'classification': 'Clasificación',
            'selection': 'Selección',
            'packaging': 'Empaque',
            'distribution': 'Distribución',
        }
        
        # Datos de lotes del frontend
        lotes_frontend = [
            {
                'code': 'LT-2026-001',
                'origin': 'Esteli',
                'variety': 'Corojo',
                'supplier': 'Tabacalera del Norte',
                'entryDate': '2026-05-15',
                'initialWeight': 1850,
                'currentWeight': 1720,
                'quantityBales': 25,
                'currentStage': 'selection',
                'status': 'active',
            },
            {
                'code': 'LT-2026-002',
                'origin': 'Jalapa',
                'variety': 'Habano',
                'supplier': 'Hojas Selectas S.A.',
                'entryDate': '2026-05-18',
                'initialWeight': 2100,
                'currentWeight': 2050,
                'quantityBales': 30,
                'currentStage': 'classification',
                'status': 'active',
            },
            {
                'code': 'LT-2026-003',
                'origin': 'Condega',
                'variety': 'Connecticut',
                'supplier': 'Tabacos Premium',
                'entryDate': '2026-05-20',
                'initialWeight': 1650,
                'currentWeight': 1600,
                'quantityBales': 20,
                'currentStage': 'reception',
                'status': 'active',
            },
            {
                'code': 'LT-2026-004',
                'origin': 'Ometepe',
                'variety': 'Criollo',
                'supplier': 'Cultivos del Valle',
                'entryDate': '2026-05-10',
                'initialWeight': 1920,
                'currentWeight': 1750,
                'quantityBales': 28,
                'currentStage': 'classification',
                'status': 'active',
            },
            {
                'code': 'LT-2026-005',
                'origin': 'Nueva Segovia',
                'variety': 'Maduro',
                'supplier': 'Golden Fields',
                'entryDate': '2026-05-05',
                'initialWeight': 2200,
                'currentWeight': 1980,
                'quantityBales': 32,
                'currentStage': 'packaging',
                'status': 'active',
            },
            {
                'code': 'LT-2026-006',
                'origin': 'Matagalpa',
                'variety': 'Sumatra',
                'supplier': 'Plantaciones del Sur',
                'entryDate': '2026-04-28',
                'initialWeight': 1780,
                'currentWeight': 1520,
                'quantityBales': 22,
                'currentStage': 'distribution',
                'status': 'active',
            },
            {
                'code': 'LT-2026-007',
                'origin': 'Esteli',
                'variety': 'Habano',
                'supplier': 'Tabacalera del Norte',
                'entryDate': '2026-04-20',
                'initialWeight': 2050,
                'currentWeight': 1720,
                'quantityBales': 26,
                'currentStage': 'distribution',
                'status': 'completed',
            },
            {
                'code': 'LT-2026-008',
                'origin': 'Jalapa',
                'variety': 'Corojo',
                'supplier': 'Hojas Selectas S.A.',
                'entryDate': '2026-05-22',
                'initialWeight': 1550,
                'currentWeight': 1550,
                'quantityBales': 18,
                'currentStage': 'reception',
                'status': 'active',
            },
        ]
        
        # Obtener usuarios del sistema
        supervisor = Usuario.objects.get(username='supervisor')
        operario1 = Usuario.objects.get(username='operario1')
        operario2 = Usuario.objects.get(username='operario2')
        
        # Migrar lotes
        lotes_migrados = 0
        for lote_data in lotes_frontend:
            try:
                # Buscar variedad
                variedad_nombre = variedades_map.get(lote_data['variety'], 'Virginia')
                variedad = VariedadTabaco.objects.get(nombre=variedad_nombre)
                
                # Buscar proveedor
                proveedor_nombre = proveedores_map.get(lote_data['supplier'], 'Tabacalera del Sur S.A.')
                proveedor = Proveedor.objects.get(nombre=proveedor_nombre)
                
                # Buscar etapa
                etapa_nombre = etapas_map.get(lote_data['currentStage'], 'Recepción')
                etapa = EtapaProductiva.objects.get(nombre=etapa_nombre)
                
                # Determinar estado
                if lote_data['status'] == 'completed':
                    estado = Lote.Estado.FINALIZADO
                elif lote_data['status'] == 'rejected':
                    estado = Lote.Estado.RECHAZADO
                else:
                    estado = Lote.Estado.EN_PRODUCCION
                
                # Asignar responsable según etapa
                if etapa.nombre in ['Recepción', 'Clasificación']:
                    responsable = operario1
                else:
                    responsable = operario2
                
                # Parsear fecha
                fecha_ingreso = datetime.strptime(lote_data['entryDate'], '%Y-%m-%d')
                fecha_ingreso = timezone.make_aware(fecha_ingreso)
                
                # Crear lote
                lote = Lote.objects.create(
                    codigo=lote_data['code'],
                    codigo_qr=f"QR-{lote_data['code']}",
                    proveedor=proveedor,
                    variedad=variedad,
                    origen=lote_data['origin'],
                    peso_inicial_kg=lote_data['initialWeight'],
                    peso_actual_kg=lote_data['currentWeight'],
                    cantidad_bultos=lote_data['quantityBales'],
                    estado=estado,
                    etapa_actual=etapa,
                    responsable_actual=responsable,
                    fecha_ingreso=fecha_ingreso,
                    fecha_inicio_produccion=fecha_ingreso if estado == Lote.Estado.EN_PRODUCCION else None,
                    fecha_finalizacion=timezone.now() if estado == Lote.Estado.FINALIZADO else None,
                    observaciones_iniciales=f'Migrado desde frontend - Origen: {lote_data["origin"]}',
                    creado_por=supervisor
                )
                
                # Crear movimiento inicial
                MovimientoLote.objects.create(
                    lote=lote,
                    etapa_destino=EtapaProductiva.objects.get(nombre='Recepción'),
                    usuario=supervisor,
                    tipo_movimiento=MovimientoLote.TipoMovimiento.INICIO,
                    observaciones='Ingreso inicial del lote (migrado desde frontend)',
                    fecha_hora=fecha_ingreso
                )
                
                # Si no está en recepción, crear movimientos intermedios
                etapas_completadas = []
                if etapa.orden > 1:
                    etapas_completadas = EtapaProductiva.objects.filter(
                        orden__lt=etapa.orden,
                        activa=True
                    ).order_by('orden')
                
                fecha_movimiento = fecha_ingreso
                for etapa_completada in etapas_completadas:
                    fecha_movimiento = fecha_movimiento + timedelta(hours=float(etapa_completada.tiempo_esperado_horas))
                    
                    MovimientoLote.objects.create(
                        lote=lote,
                        etapa_origen=EtapaProductiva.objects.filter(
                            orden=etapa_completada.orden - 1
                        ).first() if etapa_completada.orden > 1 else None,
                        etapa_destino=etapa_completada,
                        usuario=operario1 if etapa_completada.orden % 2 == 0 else operario2,
                        tipo_movimiento=MovimientoLote.TipoMovimiento.FINALIZACION,
                        cantidad_procesada_kg=lote.peso_actual_kg,
                        tiempo_trabajo_minutos=int(etapa_completada.tiempo_esperado_horas * 60),
                        incidencias=MovimientoLote.Incidencia.NINGUNA,
                        motivo_retraso=MovimientoLote.MotivoRetraso.NINGUNO,
                        observaciones=f'Procesamiento completado en {etapa_completada.nombre}',
                        fecha_hora=fecha_movimiento
                    )
                
                # Si está en etapa actual y no es recepción, crear movimiento a etapa actual
                if etapa.orden > 1:
                    fecha_movimiento = fecha_movimiento + timedelta(hours=2)
                    ultima_etapa = etapas_completadas.last() if etapas_completadas else EtapaProductiva.objects.get(nombre='Recepción')
                    
                    MovimientoLote.objects.create(
                        lote=lote,
                        etapa_origen=ultima_etapa,
                        etapa_destino=etapa,
                        usuario=responsable,
                        tipo_movimiento=MovimientoLote.TipoMovimiento.INICIO,
                        observaciones=f'Inicio de procesamiento en {etapa.nombre}',
                        fecha_hora=fecha_movimiento
                    )
                
                lotes_migrados += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Lote {lote.codigo} migrado'))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error migrando lote {lote_data["code"]}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n¡Migración completada!'))
        self.stdout.write(self.style.SUCCESS(f'Total de lotes migrados: {lotes_migrados}'))
        self.stdout.write(self.style.SUCCESS(f'\nAhora tienes {Lote.objects.count()} lotes en la base de datos'))
