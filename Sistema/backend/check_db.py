
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

print("=" * 60)
print("📊 ESTADO DE LA BASE DE DATOS")
print("=" * 60)

print(f"\n👥 Usuarios: {Usuario.objects.count()}")
print(f"📦 Proveedores: {Proveedor.objects.count()}")
print(f"🌿 Variedades: {VariedadTabaco.objects.count()}")
print(f"⚙️  Etapas: {EtapaProductiva.objects.count()}")
print(f"\n📋 Lotes: {Lote.objects.count()}")
if Lote.objects.exists():
    estados = {}
    for lote in Lote.objects.all():
        estados[lote.estado] = estados.get(lote.estado, 0) + 1
    print(f"   - {estados}")
print(f"🔄 Movimientos: {MovimientoLote.objects.count()}")
print(f"🔍 Inspecciones: {InspeccionCalidad.objects.count()}")
print(f"📝 Observaciones: {Observacion.objects.count()}")
print(f"🚨 Alertas: {Alerta.objects.count()}")
if Alerta.objects.exists():
    alertas_estado = {}
    for alerta in Alerta.objects.all():
        alertas_estado[alerta.estado] = alertas_estado.get(alerta.estado, 0) + 1
    print(f"   - {alertas_estado}")
print(f"📋 Eventos: {EventoSistema.objects.count()}")

print("\n" + "=" * 60)
print("✅ ¡Datos verificados!")
print("=" * 60)
