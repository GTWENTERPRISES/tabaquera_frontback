
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

from data.models import (
    Usuario, Proveedor, VariedadTabaco, EtapaProductiva, Lote,
    MovimientoLote, InspeccionCalidad, Observacion, Alerta, EventoSistema
)

print("="*60)
print("DATOS EN LA BASE DE DATOS:")
print("="*60)
print(f"Usuarios: {Usuario.objects.count()}")
print(f"Proveedores: {Proveedor.objects.count()}")
print(f"Variedades: {VariedadTabaco.objects.count()}")
print(f"Etapas: {EtapaProductiva.objects.count()}")
print(f"Lotes: {Lote.objects.count()}")
if Lote.objects.exists():
    for lote in Lote.objects.all():
        print(f"  - {lote.codigo} ({lote.estado})")
print(f"Movimientos: {MovimientoLote.objects.count()}")
print(f"Inspecciones: {InspeccionCalidad.objects.count()}")
print(f"Observaciones: {Observacion.objects.count()}")
print(f"Alertas: {Alerta.objects.count()}")
print(f"Eventos: {EventoSistema.objects.count()}")
print("="*60)
