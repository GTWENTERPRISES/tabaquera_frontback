#!/bin/bash

echo "========================================="
echo "  Sistema de Trazabilidad de Tabaco"
echo "  Iniciando Backend Django..."
echo "========================================="
echo ""

cd backend/back

# Verificar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "[!] No se encontró entorno virtual"
    echo "[*] Creando entorno virtual..."
    python3 -m venv venv
    echo "[OK] Entorno virtual creado"
    echo ""
fi

# Activar entorno virtual
echo "[*] Activando entorno virtual..."
source venv/bin/activate

# Verificar si requirements.txt cambió o no está instalado
if [ ! -f "venv/.installed" ]; then
    echo "[*] Instalando dependencias..."
    pip install -r requirements.txt
    touch venv/.installed
    echo "[OK] Dependencias instaladas"
    echo ""
fi

# Verificar si la base de datos existe
if [ ! -f "db.sqlite3" ]; then
    echo "[!] Base de datos no encontrada"
    echo "[*] Aplicando migraciones..."
    python manage.py makemigrations
    python manage.py migrate
    echo "[OK] Migraciones aplicadas"
    echo ""
    
    echo "[*] Inicializando datos de prueba..."
    python manage.py inicializar_datos
    echo "[OK] Datos inicializados"
    echo ""
fi

echo "========================================="
echo "  Backend corriendo en:"
echo "  http://localhost:8000"
echo ""
echo "  Admin: http://localhost:8000/admin"
echo "  Usuario: admin"
echo "  Contraseña: admin123"
echo ""
echo "  API: http://localhost:8000/api/"
echo "========================================="
echo ""

# Iniciar servidor
python manage.py runserver
