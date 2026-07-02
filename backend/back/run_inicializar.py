
import os
import django

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

# Call the command
from django.core.management import call_command
call_command('inicializar_datos')
