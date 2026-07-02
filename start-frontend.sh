#!/bin/bash

echo "========================================="
echo "  Sistema de Trazabilidad de Tabaco"
echo "  Iniciando Frontend Next.js..."
echo "========================================="
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "[!] Dependencias no instaladas"
    echo "[*] Instalando dependencias..."
    npm install
    echo "[OK] Dependencias instaladas"
    echo ""
fi

# Verificar si existe .env.local
if [ ! -f ".env.local" ]; then
    echo "[!] Archivo .env.local no encontrado"
    echo "[*] Creando desde .env.local.example..."
    cp .env.local.example .env.local
    echo "[OK] Archivo .env.local creado"
    echo ""
    echo "[!] Por favor verifica la configuración en .env.local"
    echo ""
fi

echo "========================================="
echo "  Frontend corriendo en:"
echo "  http://localhost:3000"
echo ""
echo "  Asegúrate de que el backend esté corriendo"
echo "  en http://localhost:8000"
echo "========================================="
echo ""

# Iniciar servidor de desarrollo
npm run dev
