"""
seed_missing_data.py
Adds only the records that are missing according to the database-design.md spec.
Idempotent — safe to run multiple times, will skip existing records.
"""
from django.core.management.base import BaseCommand
from datetime import timezone as stdlib_tz
from data.models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva, Lote,
    MovimientoLote, InspeccionCalidad, EvidenciaCalidad,
    Observacion, EventoSistema, Notificacion, ConfiguracionSistema, Alerta
)


def dt(iso: str):
    """Parse ISO datetime string → aware UTC datetime."""
    from datetime import datetime as _dt
    d = _dt.fromisoformat(iso.replace('Z', '+00:00'))
    if d.tzinfo is None:
        d = d.replace(tzinfo=stdlib_tz.utc)
    return d


class Command(BaseCommand):
    help = 'Seeds missing records per database-design.md spec (idempotent)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('=== Seeding missing data ==='))
        self._seed_variedades()
        self._seed_proveedor_test()
        self._seed_usuarios()
        self._seed_configuracion()
        self._seed_lotes()
        self._seed_movimientos()
        self._seed_inspecciones()
        self._seed_evidencias()
        self._seed_observaciones()
        self._seed_eventos()
        self._seed_notificaciones()
        self._print_summary()

    # ── helpers ───────────────────────────────────────────────────────────────

    def _etapa(self, nombre: str) -> EtapaProductiva:
        return EtapaProductiva.objects.get(nombre=nombre)

    def _lote(self, codigo: str) -> Lote:
        return Lote.objects.get(codigo=codigo)

    def _user(self, username: str) -> Usuario:
        return Usuario.objects.get(username=username)

    # ── 1. variedades ─────────────────────────────────────────────────────────
    def _seed_variedades(self):
        needed = ['Corojo', 'Habano', 'Connecticut', 'Criollo', 'Maduro', 'Sumatra', 'TestVar']
        created = 0
        for name in needed:
            _, c = VariedadTabaco.objects.get_or_create(
                nombre=name,
                defaults={'descripcion': '', 'caracteristicas': '', 'activo': True}
            )
            if c:
                created += 1
        self.stdout.write(f'  Variedades creadas: {created}')

    # ── 2. proveedor test ─────────────────────────────────────────────────────
    def _seed_proveedor_test(self):
        _, c = Proveedor.objects.get_or_create(
            nombre='Proveedor Test',
            defaults={'origen': 'Test', 'estado': Proveedor.Estado.ACTIVO}
        )
        self.stdout.write(f'  Proveedor Test: {"creado" if c else "ya existe"}')

    # ── 3. usuarios ───────────────────────────────────────────────────────────
    def _seed_usuarios(self):
        users_data = [
            dict(username='sistema', email='system@goldenleaf.com',
                 nombres='Sistema', apellidos='', telefono='0000000000',
                 rol=Usuario.Rol.ADMINISTRADOR, departamento=Usuario.Departamento.ADMINISTRACION,
                 estado=Usuario.Estado.ACTIVO),
            dict(username='fernando.aguilar', email='',
                 nombres='Fernando', apellidos='Aguilar', telefono='0000000000',
                 rol=Usuario.Rol.CONTROL_CALIDAD, departamento=Usuario.Departamento.CALIDAD,
                 estado=Usuario.Estado.ACTIVO),
            dict(username='lucia.medina', email='',
                 nombres='Lucia', apellidos='Medina', telefono='0000000000',
                 rol=Usuario.Rol.CONTROL_CALIDAD, departamento=Usuario.Departamento.CALIDAD,
                 estado=Usuario.Estado.ACTIVO),
            dict(username='andres.herrera', email='',
                 nombres='Andres', apellidos='Herrera', telefono='0000000000',
                 rol=Usuario.Rol.CONTROL_CALIDAD, departamento=Usuario.Departamento.CALIDAD,
                 estado=Usuario.Estado.ACTIVO),
            dict(username='beatriz.rojas', email='',
                 nombres='Beatriz', apellidos='Rojas', telefono='0000000000',
                 rol=Usuario.Rol.CONTROL_CALIDAD, departamento=Usuario.Departamento.CALIDAD,
                 estado=Usuario.Estado.ACTIVO),
        ]
        created = 0
        for data in users_data:
            username = data.pop('username')
            email = data.pop('email', '')
            u, c = Usuario.objects.get_or_create(username=username, defaults={**data, 'email': email})
            if c:
                u.set_password('password123')
                u.save()
                created += 1
        self.stdout.write(f'  Usuarios creados: {created}')

    # ── 4. configuración ──────────────────────────────────────────────────────
    def _seed_configuracion(self):
        configs = [
            ('humedad_maxima', '70', 'Humedad relativa máxima permitida'),
            ('temperatura_optima', '28', 'Temperatura óptima (grados C)'),
        ]
        created = 0
        for clave, valor, desc in configs:
            _, c = ConfiguracionSistema.objects.get_or_create(
                clave=clave, defaults={'valor': valor, 'descripcion': desc}
            )
            if c:
                created += 1
        self.stdout.write(f'  ConfiguracionSistema creadas: {created}')

    # ── 5. lotes ──────────────────────────────────────────────────────────────
    def _seed_lotes(self):
        """Add only the lotes that don't exist yet per the design spec."""
        lotes_spec = [
            dict(codigo='LT-2026-001', qr_code='QR-LT-2026-001', origen='Esteli',
                 variedad='Corojo', proveedor='Tabacalera del Norte',
                 peso_inicial_kg=1850, peso_actual_kg=1720, cantidad_bultos=25,
                 etapa='Selección', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='carlos.martinez', fecha_ingreso='2026-05-15T08:00:00Z'),
            dict(codigo='LT-2026-002', qr_code='QR-LT-2026-002', origen='Jalapa',
                 variedad='Habano', proveedor='Hojas Selectas S.A.',
                 peso_inicial_kg=2100, peso_actual_kg=2050, cantidad_bultos=30,
                 etapa='Clasificación', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='maria.lopez', fecha_ingreso='2026-05-18T08:00:00Z'),
            dict(codigo='LT-2026-003', qr_code='QR-LT-2026-003', origen='Condega',
                 variedad='Connecticut', proveedor='Tabacos Premium',
                 peso_inicial_kg=1650, peso_actual_kg=1600, cantidad_bultos=20,
                 etapa='Recepción', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='juan.garcia', fecha_ingreso='2026-05-20T08:00:00Z'),
            dict(codigo='LT-2026-004', qr_code='QR-LT-2026-004', origen='Ometepe',
                 variedad='Criollo', proveedor='Cultivos del Valle',
                 peso_inicial_kg=1920, peso_actual_kg=1750, cantidad_bultos=28,
                 etapa='Clasificación', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='carlos.martinez', fecha_ingreso='2026-05-10T08:00:00Z'),
            dict(codigo='LT-2026-005', qr_code='QR-LT-2026-005', origen='Nueva Segovia',
                 variedad='Maduro', proveedor='Golden Fields',
                 peso_inicial_kg=2200, peso_actual_kg=1980, cantidad_bultos=32,
                 etapa='Empaque', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='maria.lopez', fecha_ingreso='2026-05-05T08:00:00Z'),
            dict(codigo='LT-2026-006', qr_code='QR-LT-2026-006', origen='Matagalpa',
                 variedad='Sumatra', proveedor='Plantaciones del Sur',
                 peso_inicial_kg=1780, peso_actual_kg=1520, cantidad_bultos=22,
                 etapa='Distribución', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='juan.garcia', fecha_ingreso='2026-04-28T08:00:00Z'),
            dict(codigo='LT-2026-007', qr_code='QR-LT-2026-007', origen='Esteli',
                 variedad='Habano', proveedor='Tabacalera del Norte',
                 peso_inicial_kg=2050, peso_actual_kg=1720, cantidad_bultos=26,
                 etapa='Distribución', estado=Lote.Estado.FINALIZADO,
                 responsable='carlos.martinez', fecha_ingreso='2026-04-20T08:00:00Z'),
            dict(codigo='LT-2026-008', qr_code='QR-LT-2026-008', origen='Jalapa',
                 variedad='Corojo', proveedor='Hojas Selectas S.A.',
                 peso_inicial_kg=1550, peso_actual_kg=1550, cantidad_bultos=18,
                 etapa='Recepción', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='maria.lopez', fecha_ingreso='2026-05-22T08:00:00Z'),
            dict(codigo='LT-2026-009', qr_code='QR-LT-2026-009', origen='Esteli',
                 variedad='Corojo', proveedor='Tabacalera del Norte',
                 peso_inicial_kg=1500, peso_actual_kg=1500, cantidad_bultos=20,
                 etapa='Clasificación', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='carlos.martinez', fecha_ingreso='2026-06-30T20:23:28Z'),
            dict(codigo='LT-2026-010', qr_code='QR-LT-2026-010', origen='Test',
                 variedad='TestVar', proveedor='Proveedor Test',
                 peso_inicial_kg=1000, peso_actual_kg=1000, cantidad_bultos=10,
                 etapa='Recepción', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='carlos.martinez', fecha_ingreso='2026-06-30T20:28:00Z'),
            dict(codigo='LT-2026-011', qr_code='QR-LT-2026-011', origen='Test',
                 variedad='TestVar', proveedor='Proveedor Test',
                 peso_inicial_kg=1000, peso_actual_kg=1000, cantidad_bultos=10,
                 etapa='Recepción', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='carlos.martinez', fecha_ingreso='2026-06-30T20:30:36Z'),
            dict(codigo='LT-2026-012', qr_code='QR-LT-2026-012', origen='Test',
                 variedad='TestVar', proveedor='Proveedor Test',
                 peso_inicial_kg=1000, peso_actual_kg=1000, cantidad_bultos=10,
                 etapa='Recepción', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='carlos.martinez', fecha_ingreso='2026-06-30T20:30:52Z'),
            dict(codigo='LT-2026-013', qr_code='QR-LT-2026-013', origen='Test',
                 variedad='TestVar', proveedor='Proveedor Test',
                 peso_inicial_kg=1000, peso_actual_kg=1000, cantidad_bultos=10,
                 etapa='Recepción', estado=Lote.Estado.EN_PRODUCCION,
                 responsable='carlos.martinez', fecha_ingreso='2026-06-30T20:31:28Z'),
        ]
        created = 0
        for spec in lotes_spec:
            if Lote.objects.filter(codigo=spec['codigo']).exists():
                # Update estado/etapa/pesos if the record exists but is stale
                lote = Lote.objects.get(codigo=spec['codigo'])
                changed = False
                etapa_obj = EtapaProductiva.objects.filter(nombre=spec['etapa']).first()
                if etapa_obj and lote.etapa_actual != etapa_obj:
                    lote.etapa_actual = etapa_obj
                    changed = True
                if lote.estado != spec['estado']:
                    lote.estado = spec['estado']
                    changed = True
                if changed:
                    lote.save()
                continue
            try:
                proveedor = Proveedor.objects.get(nombre=spec['proveedor'])
                variedad = VariedadTabaco.objects.get(nombre=spec['variedad'])
                etapa = EtapaProductiva.objects.get(nombre=spec['etapa'])
                responsable = Usuario.objects.filter(username=spec['responsable']).first()
                creado_por = Usuario.objects.filter(username='carlos.martinez').first()
                Lote.objects.create(
                    codigo=spec['codigo'],
                    codigo_qr=spec['qr_code'],
                    proveedor=proveedor,
                    variedad=variedad,
                    origen=spec['origen'],
                    peso_inicial_kg=spec['peso_inicial_kg'],
                    peso_actual_kg=spec['peso_actual_kg'],
                    cantidad_bultos=spec['cantidad_bultos'],
                    etapa_actual=etapa,
                    estado=spec['estado'],
                    responsable_actual=responsable,
                    fecha_ingreso=dt(spec['fecha_ingreso']),
                    creado_por=creado_por,
                )
                created += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ERROR lote {spec["codigo"]}: {e}'))
        self.stdout.write(f'  Lotes creados: {created} | total: {Lote.objects.count()}')

    # ── 6. movimientos ────────────────────────────────────────────────────────
    def _seed_movimientos(self):
        """
        For each spec lote, ensure it has at least one INICIO movimiento and
        the correct stage-change chain up to its current etapa.
        Only inserts if missing (identified by lote+tipo+etapa_destino+fecha_hora).
        """
        spec = [
            # (lote, tipo, etapa_origen, etapa_destino, fecha_inicio, fecha_fin, obs)
            ('LT-2026-001', 'inicio', None, 'Recepción', '2026-05-15T10:00:00Z', None, None),
            ('LT-2026-001', 'finalizacion', 'Recepción', 'Clasificación', '2026-05-16T10:00:00Z', '2026-05-16T14:00:00Z', None),
            ('LT-2026-001', 'finalizacion', 'Clasificación', 'Selección', '2026-05-17T10:00:00Z', None, None),
            ('LT-2026-002', 'inicio', None, 'Recepción', '2026-05-18T10:00:00Z', None, None),
            ('LT-2026-002', 'finalizacion', 'Recepción', 'Clasificación', '2026-05-19T10:00:00Z', None, None),
            ('LT-2026-003', 'inicio', None, 'Recepción', '2026-05-20T10:00:00Z', None, None),
            ('LT-2026-004', 'inicio', None, 'Recepción', '2026-05-10T10:00:00Z', None, None),
            ('LT-2026-004', 'finalizacion', 'Recepción', 'Clasificación', '2026-05-11T10:00:00Z', None, None),
            ('LT-2026-005', 'inicio', None, 'Recepción', '2026-05-05T10:00:00Z', None, None),
            ('LT-2026-005', 'finalizacion', 'Recepción', 'Clasificación', '2026-05-06T10:00:00Z', '2026-05-06T14:00:00Z', None),
            ('LT-2026-005', 'finalizacion', 'Clasificación', 'Selección', '2026-05-07T10:00:00Z', '2026-05-07T14:00:00Z', None),
            ('LT-2026-005', 'finalizacion', 'Selección', 'Empaque', '2026-05-08T10:00:00Z', None, None),
            ('LT-2026-006', 'inicio', None, 'Recepción', '2026-04-28T10:00:00Z', None, None),
            ('LT-2026-006', 'finalizacion', 'Recepción', 'Clasificación', '2026-04-29T10:00:00Z', '2026-04-29T14:00:00Z', None),
            ('LT-2026-006', 'finalizacion', 'Clasificación', 'Selección', '2026-04-30T10:00:00Z', '2026-04-30T14:00:00Z', None),
            ('LT-2026-006', 'finalizacion', 'Selección', 'Empaque', '2026-05-01T10:00:00Z', '2026-05-01T14:00:00Z', None),
            ('LT-2026-006', 'finalizacion', 'Empaque', 'Distribución', '2026-05-02T10:00:00Z', None, None),
            ('LT-2026-007', 'inicio', None, 'Recepción', '2026-04-20T10:00:00Z', None, None),
            ('LT-2026-007', 'finalizacion', 'Recepción', 'Clasificación', '2026-04-21T10:00:00Z', '2026-04-21T14:00:00Z', None),
            ('LT-2026-007', 'finalizacion', 'Clasificación', 'Selección', '2026-04-22T10:00:00Z', '2026-04-22T14:00:00Z', None),
            ('LT-2026-007', 'finalizacion', 'Selección', 'Empaque', '2026-04-23T10:00:00Z', '2026-04-23T14:00:00Z', None),
            ('LT-2026-007', 'finalizacion', 'Empaque', 'Distribución', '2026-04-24T10:00:00Z', None, None),
            ('LT-2026-008', 'inicio', None, 'Recepción', '2026-05-22T10:00:00Z', None, None),
            ('LT-2026-009', 'inicio', None, 'Recepción', '2026-06-30T20:23:28Z', '2026-06-30T20:23:32Z', None),
            ('LT-2026-009', 'finalizacion', 'Recepción', 'Clasificación', '2026-06-30T20:23:32Z', None, 'Prueba de movimiento de etapa'),
            ('LT-2026-010', 'inicio', None, 'Recepción', '2026-06-30T20:28:00Z', None, None),
            ('LT-2026-011', 'inicio', None, 'Recepción', '2026-06-30T20:30:36Z', None, None),
            ('LT-2026-012', 'inicio', None, 'Recepción', '2026-06-30T20:30:52Z', None, None),
            ('LT-2026-013', 'inicio', None, 'Recepción', '2026-06-30T20:31:28Z', None, None),
        ]
        created = 0
        for row in spec:
            codigo, tipo, orig_name, dest_name, fecha_str, fin_str, obs = row
            if not Lote.objects.filter(codigo=codigo).exists():
                continue
            lote = self._lote(codigo)
            etapa_orig = EtapaProductiva.objects.filter(nombre=orig_name).first() if orig_name else None
            etapa_dest = EtapaProductiva.objects.filter(nombre=dest_name).first() if dest_name else None
            fecha = dt(fecha_str)
            # Skip if an identical movement already exists (same lote + tipo + destino + fecha)
            qs = MovimientoLote.objects.filter(lote=lote, tipo_movimiento=tipo, fecha_hora=fecha)
            if etapa_dest:
                qs = qs.filter(etapa_destino=etapa_dest)
            if qs.exists():
                continue
            try:
                usuario = Usuario.objects.filter(username='carlos.martinez').first()
                if codigo == 'LT-2026-002' or codigo == 'LT-2026-008':
                    usuario = Usuario.objects.filter(username='maria.lopez').first()
                elif codigo == 'LT-2026-003' or codigo == 'LT-2026-006':
                    usuario = Usuario.objects.filter(username='juan.garcia').first()
                MovimientoLote.objects.create(
                    lote=lote,
                    etapa_origen=etapa_orig,
                    etapa_destino=etapa_dest,
                    usuario=usuario,
                    tipo_movimiento=tipo,
                    fecha_hora=fecha,
                    observaciones=obs or '',
                )
                created += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ERROR mov {codigo} {tipo}: {e}'))
        self.stdout.write(f'  Movimientos creados: {created} | total: {MovimientoLote.objects.count()}')

    # ── 7. inspecciones ───────────────────────────────────────────────────────
    def _seed_inspecciones(self):
        """
        Add the 7 spec inspecciones. Skip if the same lote+etapa+inspector+fecha already exists.
        """
        spec = [
            dict(lote='LT-2026-001', etapa='Selección', inspector='fernando.aguilar',
                 grado='A', estado='aprobado', decision='aprobar',
                 temp=28.50, hum=68.00, peso=1720.00, qr=True,
                 fecha_inicio='2026-06-01T09:00:00Z', motivos=[]),
            dict(lote='LT-2026-002', etapa='Clasificación', inspector='lucia.medina',
                 grado='A', estado='aprobado', decision='aprobar',
                 temp=32.00, hum=55.00, peso=2050.00, qr=True,
                 fecha_inicio='2026-05-31T10:30:00Z', motivos=[]),
            dict(lote='LT-2026-004', etapa='Clasificación', inspector='andres.herrera',
                 grado='B', estado='aprobado_con_observaciones', decision='aprobar',
                 temp=24.00, hum=62.00, peso=1750.00, qr=True,
                 fecha_inicio='2026-05-30T14:15:00Z', motivos=[]),
            dict(lote='LT-2026-005', etapa='Empaque', inspector='beatriz.rojas',
                 grado='A', estado='aprobado', decision='aprobar',
                 temp=22.00, hum=58.00, peso=1980.00, qr=True,
                 fecha_inicio='2026-05-29T08:45:00Z', motivos=[]),
            dict(lote='LT-2026-006', etapa='Distribución', inspector='fernando.aguilar',
                 grado='B', estado='aprobado', decision='aprobar',
                 temp=20.50, hum=60.00, peso=1520.00, qr=True,
                 fecha_inicio='2026-05-28T16:20:00Z', motivos=[]),
            dict(lote='LT-2026-007', etapa='Distribución', inspector='lucia.medina',
                 grado='A', estado='aprobado', decision='aprobar',
                 temp=21.00, hum=55.00, peso=1720.00, qr=True,
                 fecha_inicio='2026-05-27T11:00:00Z', motivos=[]),
            dict(lote='LT-2026-003', etapa='Recepción', inspector='andres.herrera',
                 grado='C', estado='rechazado', decision='solicitar_correccion',
                 temp=26.00, hum=72.00, peso=1600.00, qr=True,
                 fecha_inicio='2026-05-26T13:30:00Z', motivos=['humedad_excesiva']),
        ]
        created = 0
        for row in spec:
            if not Lote.objects.filter(codigo=row['lote']).exists():
                continue
            lote = self._lote(row['lote'])
            etapa = EtapaProductiva.objects.filter(nombre=row['etapa']).first()
            inspector = Usuario.objects.filter(username=row['inspector']).first()
            fecha = dt(row['fecha_inicio'])
            if InspeccionCalidad.objects.filter(lote=lote, etapa=etapa, inspector=inspector, fecha_hora_inicio=fecha).exists():
                continue
            try:
                InspeccionCalidad.objects.create(
                    lote=lote, etapa=etapa, inspector=inspector,
                    estado_calidad=row['estado'],
                    grado_calidad=row['grado'],
                    decision=row['decision'],
                    temperatura=row['temp'],
                    humedad=row['hum'],
                    peso_kg=row['peso'],
                    qr_verificado=row['qr'],
                    humedad_correcta=(row['hum'] <= 70),
                    temperatura_correcta=True,
                    peso_correcto=True,
                    embalaje_correcto=True,
                    etiquetado_correcto=True,
                    qr_legible=True,
                    motivo_rechazo=row['motivos'][0] if row['motivos'] else 'ninguno',
                    observaciones='',
                    fecha_hora_inicio=fecha,
                )
                created += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ERROR insp {row["lote"]}: {e}'))
        self.stdout.write(f'  Inspecciones creadas: {created} | total: {InspeccionCalidad.objects.count()}')

    # ── 8. evidencias ─────────────────────────────────────────────────────────
    def _seed_evidencias(self):
        spec = [
            dict(lote='LT-2026-001', etapa='Selección', inspector='fernando.aguilar',
                 tipo='foto', nombre='lote_seleccion.jpg',
                 url='https://images.unsplash.com/photo-1598228725387-d4a628003205?w=800',
                 uploaded_by='fernando.aguilar'),
            dict(lote='LT-2026-001', etapa='Selección', inspector='fernando.aguilar',
                 tipo='foto', nombre='detalle_tabla.jpg',
                 url='https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
                 uploaded_by='fernando.aguilar'),
            dict(lote='LT-2026-003', etapa='Recepción', inspector='andres.herrera',
                 tipo='foto', nombre='lote_humedad.jpg',
                 url='/evidence/lote_humedad.jpg',
                 uploaded_by='andres.herrera'),
        ]
        created = 0
        for row in spec:
            if not Lote.objects.filter(codigo=row['lote']).exists():
                continue
            lote = self._lote(row['lote'])
            etapa = EtapaProductiva.objects.filter(nombre=row['etapa']).first()
            inspector = Usuario.objects.filter(username=row['inspector']).first()
            insp = InspeccionCalidad.objects.filter(lote=lote, etapa=etapa, inspector=inspector).first()
            if not insp:
                continue
            if EvidenciaCalidad.objects.filter(inspeccion=insp, nombre_archivo=row['nombre']).exists():
                continue
            try:
                uploaded = Usuario.objects.filter(username=row['uploaded_by']).first()
                EvidenciaCalidad.objects.create(
                    inspeccion=insp,
                    tipo=EvidenciaCalidad.TipoEvidencia.FOTO,
                    url_externa=row['url'] if row['url'].startswith('http') else '',
                    nombre_archivo=row['nombre'],
                    descripcion='',
                    uploaded_by=uploaded,
                )
                created += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ERROR evidencia {row["nombre"]}: {e}'))
        self.stdout.write(f'  Evidencias creadas: {created} | total: {EvidenciaCalidad.objects.count()}')

    # ── 9. observaciones ──────────────────────────────────────────────────────
    def _seed_observaciones(self):
        spec = [
            dict(lote='LT-2026-004', etapa='Clasificación', usuario='juan.garcia',
                 texto='Se notó un ligero daño físico en algunas hojas.',
                 fecha='2026-06-30T19:25:20Z'),
            dict(lote='LT-2026-001', etapa=None, usuario='carlos.martinez',
                 texto='Prueba de observación desde API', fecha='2026-06-30T20:24:31Z'),
            dict(lote='LT-2026-001', etapa=None, usuario='carlos.martinez',
                 texto='Test desde PowerShell API', fecha='2026-06-30T20:26:10Z'),
            dict(lote='LT-2026-001', etapa=None, usuario='carlos.martinez',
                 texto='Observacion de prueba API', fecha='2026-06-30T20:28:10Z'),
            dict(lote='LT-2026-001', etapa=None, usuario='carlos.martinez',
                 texto='Observacion de prueba API', fecha='2026-06-30T20:30:46Z'),
            dict(lote='LT-2026-001', etapa=None, usuario='carlos.martinez',
                 texto='Observacion de prueba API', fecha='2026-06-30T20:31:01Z'),
            dict(lote='LT-2026-001', etapa=None, usuario='carlos.martinez',
                 texto='Observacion de prueba API', fecha='2026-06-30T20:31:30Z'),
        ]
        created = 0
        for row in spec:
            if not Lote.objects.filter(codigo=row['lote']).exists():
                continue
            lote = self._lote(row['lote'])
            etapa = EtapaProductiva.objects.filter(nombre=row['etapa']).first() if row['etapa'] else None
            usuario = Usuario.objects.filter(username=row['usuario']).first()
            fecha = dt(row['fecha'])
            if Observacion.objects.filter(lote=lote, usuario=usuario, fecha_hora=fecha, contenido=row['texto']).exists():
                continue
            try:
                Observacion.objects.create(
                    lote=lote, etapa=etapa, usuario=usuario,
                    tipo=Observacion.TipoObservacion.GENERAL,
                    contenido=row['texto'], fecha_hora=fecha,
                )
                created += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ERROR obs {row["lote"]}: {e}'))
        self.stdout.write(f'  Observaciones creadas: {created} | total: {Observacion.objects.count()}')

    # ── 10. eventos ───────────────────────────────────────────────────────────
    def _seed_eventos(self):
        spec = [
            dict(tipo='creacion_lote', lote='LT-2026-008', usuario='maria.lopez',
                 descripcion='Se registro el lote LT-2026-008 proveniente de Jalapa',
                 fecha='2026-06-30T19:25:17Z'),
            dict(tipo='inspeccion_calidad', lote='LT-2026-001', usuario='ana.rodriguez',
                 descripcion='Control de calidad aprobado para LT-2026-001',
                 fecha='2026-06-30T19:25:18Z'),
            dict(tipo='movimiento_etapa', lote='LT-2026-005', usuario='juan.garcia',
                 descripcion='Inicio de empaque para LT-2026-005',
                 fecha='2026-06-30T19:25:18Z'),
            dict(tipo='alerta_generada', lote='LT-2026-003', usuario='sistema',
                 descripcion='LT-2026-003 requiere revision - humedad fuera de rango',
                 fecha='2026-06-30T19:25:18Z'),
            dict(tipo='movimiento_etapa', lote='LT-2026-007', usuario='carlos.martinez',
                 descripcion='LT-2026-007 completo el proceso de distribucion',
                 fecha='2026-06-30T19:25:18Z'),
            dict(tipo='movimiento_etapa', lote='LT-2026-002', usuario='juan.garcia',
                 descripcion='LT-2026-002 paso de Recepcion a Clasificacion',
                 fecha='2026-06-30T19:25:18Z'),
            dict(tipo='inspeccion_calidad', lote='LT-2026-004', usuario='ana.rodriguez',
                 descripcion='Control de calidad para LT-2026-004 con observaciones',
                 fecha='2026-06-30T19:25:19Z'),
        ]
        created = 0
        for row in spec:
            lote = Lote.objects.filter(codigo=row['lote']).first()
            usuario = Usuario.objects.filter(username=row['usuario']).first()
            fecha = dt(row['fecha'])
            if EventoSistema.objects.filter(descripcion=row['descripcion'], fecha_hora=fecha).exists():
                continue
            try:
                EventoSistema.objects.create(
                    tipo=row['tipo'],
                    lote=lote,
                    usuario=usuario,
                    descripcion=row['descripcion'],
                    fecha_hora=fecha,
                )
                created += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ERROR evento: {e}'))
        self.stdout.write(f'  Eventos creados: {created} | total: {EventoSistema.objects.count()}')

    # ── 11. notificaciones ────────────────────────────────────────────────────
    def _seed_notificaciones(self):
        spec = [
            dict(username='carlos.martinez', tipo='info', categoria='lot',
                 titulo='Nuevo lote registrado',
                 mensaje='Carlos Martínez creó el lote LT-2026-001.',
                 lote='LT-2026-001', url='/dashboard/lotes/LT-2026-001', leida=True),
            dict(username='maria.lopez', tipo='warning', categoria='quality',
                 titulo='Lote rechazado',
                 mensaje='LT-2026-003 fue rechazado por humedad elevada.',
                 lote='LT-2026-003', url='/dashboard/calidad', leida=False),
        ]
        created = 0
        for row in spec:
            usuario = Usuario.objects.filter(username=row['username']).first()
            if not usuario:
                continue
            if Notificacion.objects.filter(usuario=usuario, titulo=row['titulo']).exists():
                continue
            lote = Lote.objects.filter(codigo=row['lote']).first()
            try:
                Notificacion.objects.create(
                    usuario=usuario,
                    lote=lote,
                    lote_codigo=row['lote'],
                    tipo=row['tipo'],
                    categoria=row['categoria'],
                    titulo=row['titulo'],
                    mensaje=row['mensaje'],
                    url_accion=row['url'],
                    leida=row['leida'],
                )
                created += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ERROR notif: {e}'))
        self.stdout.write(f'  Notificaciones creadas: {created} | total: {Notificacion.objects.count()}')

    # ── summary ───────────────────────────────────────────────────────────────
    def _print_summary(self):
        self.stdout.write(self.style.SUCCESS('\n=== DB Summary ==='))
        models = [
            ('EtapaProductiva', EtapaProductiva),
            ('Proveedor', Proveedor),
            ('VariedadTabaco', VariedadTabaco),
            ('Usuario', Usuario),
            ('Lote', Lote),
            ('MovimientoLote', MovimientoLote),
            ('InspeccionCalidad', InspeccionCalidad),
            ('EvidenciaCalidad', EvidenciaCalidad),
            ('Observacion', Observacion),
            ('EventoSistema', EventoSistema),
            ('Notificacion', Notificacion),
            ('ConfiguracionSistema', ConfiguracionSistema),
        ]
        for name, model in models:
            self.stdout.write(f'  {name}: {model.objects.count()}')
        self.stdout.write(self.style.SUCCESS('\nCredentials (design spec users):'))
        self.stdout.write('  carlos.martinez / password123  (admin)')
        self.stdout.write('  maria.lopez / password123      (supervisor)')
        self.stdout.write('  juan.garcia / password123      (operario)')
        self.stdout.write('  ana.rodriguez / password123    (control_calidad)')
        self.stdout.write('  fernando.aguilar / password123 (control_calidad)')
