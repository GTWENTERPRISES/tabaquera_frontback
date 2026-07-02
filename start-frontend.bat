@echo off
echo =========================================
echo   Sistema de Trazabilidad de Tabaco
echo   Iniciando Frontend Next.js...
echo =========================================
echo.

REM Verificar si node_modules existe
if not exist "node_modules\" (
    echo [!] Dependencias no instaladas
    echo [*] Instalando dependencias...
    npm install
    echo [OK] Dependencias instaladas
    echo.
)

REM Verificar si existe .env.local
if not exist ".env.local" (
    echo [!] Archivo .env.local no encontrado
    echo [*] Creando desde .env.local.example...
    copy .env.local.example .env.local
    echo [OK] Archivo .env.local creado
    echo.
    echo [!] Por favor verifica la configuracion en .env.local
    echo.
)

echo =========================================
echo   Frontend corriendo en:
echo   http://localhost:3000
echo   
echo   Asegurate de que el backend este corriendo
echo   en http://localhost:8000
echo =========================================
echo.

REM Iniciar servidor de desarrollo
npm run dev

pause
