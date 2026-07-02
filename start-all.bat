@echo off
echo =========================================
echo   Sistema de Trazabilidad de Tabaco
echo   Iniciando Sistema Completo...
echo =========================================
echo.

echo [*] Iniciando Backend Django...
start "Backend Django" cmd /k start-backend.bat

echo [*] Esperando 5 segundos para que inicie el backend...
timeout /t 5 /nobreak > nul

echo [*] Iniciando Frontend Next.js...
start "Frontend Next.js" cmd /k start-frontend.bat

echo.
echo =========================================
echo   Sistema Iniciado!
echo =========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   Admin:    http://localhost:8000/admin
echo.
echo   Credenciales de prueba:
echo   - admin / admin123 (Administrador)
echo   - supervisor / supervisor123 (Supervisor)
echo   - operario1 / operario123 (Operario)
echo   - calidad / calidad123 (Control de Calidad)
echo.
echo =========================================
echo.

pause
