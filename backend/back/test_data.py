
import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "back.settings")
django.setup()
from data.models import EtapaProductiva

print("Trying to create etapa...")
data = {
    'nombre': 'Recepción',
    'orden': 1,
    'descripcion': 'Recepción, verificación y pesaje inicial del lote',
    'tiempo_esperado_horas': 2.0,
    'activo': True
}

try:
    obj, created = EtapaProductiva.objects.get_or_create(nombre=data['nombre'], defaults=data)
    print(f"Created: {created}")
    print(f"Obj: {obj}")
    print(f"All etapas: {list(EtapaProductiva.objects.all())}")
except Exception as e:
    print(f"Error: {type(e)} - {e}")
    import traceback
    traceback.print_exc()

