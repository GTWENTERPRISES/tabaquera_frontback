
import os
import sys
import django

# Añadir el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

from django.core.management import call_command

# Ejecutar el comando de inicialización
print("=" * 60)
print("🚀 INICIALIZANDO BASE DE DATOS")
print("=" * 60)
call_command('inicializar_datos')
