#!/bin/bash

echo "========================================="
echo "  Sistema de Trazabilidad de Tabaco"
echo "  Iniciando Sistema Completo..."
echo "========================================="
echo ""

# Hacer ejecutables los scripts si no lo son
chmod +x start-backend.sh
chmod +x start-frontend.sh

echo "[*] Iniciando Backend Django..."
gnome-terminal -- bash -c "./start-backend.sh; exec bash" 2>/dev/null || \
xterm -e "./start-backend.sh" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "./start-backend.sh"' 2>/dev/null || \
echo "[!] No se pudo abrir terminal para backend. Ejecútalo manualmente: ./start-backend.sh"

echo "[*] Esperando 5 segundos para que inicie el backend..."
sleep 5

echo "[*] Iniciando Frontend Next.js..."
gnome-terminal -- bash -c "./start-frontend.sh; exec bash" 2>/dev/null || \
xterm -e "./start-frontend.sh" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "./start-frontend.sh"' 2>/dev/null || \
echo "[!] No se pudo abrir terminal para frontend. Ejecútalo manualmente: ./start-frontend.sh"

echo ""
echo "========================================="
echo "  Sistema Iniciado!"
echo "========================================="
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  Admin:    http://localhost:8000/admin"
echo ""
echo "  Credenciales de prueba:"
echo "  - admin / admin123 (Administrador)"
echo "  - supervisor / supervisor123 (Supervisor)"
echo "  - operario1 / operario123 (Operario)"
echo "  - calidad / calidad123 (Control de Calidad)"
echo ""
echo "========================================="
echo ""
