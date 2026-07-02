@echo off
echo =========================================
echo   Sistema de Trazabilidad de Tabaco
echo   Iniciando Backend Django...
echo =========================================
echo.

cd backend\back

REM Verificar si existe el entorno virtual
if not exist "venv\" (
    echo [!] No se encontro entorno virtual
    echo [*] Creando entorno virtual...
    python -m venv venv
    echo [OK] Entorno virtual creado
    echo.
)

REM Activar entorno virtual
echo [*] Activando entorno virtual...
call venv\Scripts\activate

REM Verificar si requirements.txt cambio o no esta instalado
if not exist "venv\.installed" (
    echo [*] Instalando dependencias...
    pip install -r requirements.txt
    echo installed > venv\.installed
    echo [OK] Dependencias instaladas
    echo.
)

REM Verificar si la base de datos existe
if not exist "db.sqlite3" (
    echo [!] Base de datos no encontrada
    echo [*] Aplicando migraciones...
    python manage.py makemigrations
    python manage.py migrate
    echo [OK] Migraciones aplicadas
    echo.
    
    echo [*] Inicializando datos de prueba...
    python manage.py inicializar_datos
    echo [OK] Datos inicializados
    echo.
)

echo =========================================
echo   Backend corriendo en:
echo   http://localhost:8000
echo   
echo   Admin: http://localhost:8000/admin
echo   Usuario: admin
echo   Contraseña: admin123
echo   
echo   API: http://localhost:8000/api/
echo =========================================
echo.

REM Iniciar servidor
python manage.py runserver

pause
