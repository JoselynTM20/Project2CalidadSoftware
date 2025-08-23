#!/bin/bash

# Script de instalación para el Sistema de Gestión de Productos
# Proyecto de Calidad de Software - UTN

echo "🚀 Instalando Sistema de Gestión de Productos..."
echo "================================================"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 16+ primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm verificados"

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi

echo "✅ Backend instalado correctamente"

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del frontend"
    exit 1
fi

echo "✅ Frontend instalado correctamente"

# Volver al directorio raíz
cd ..

echo ""
echo "🎉 ¡Instalación completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tu base de datos PostgreSQL"
echo "2. Ejecuta el script SQL proporcionado"
echo "3. Copia env.example a .env en la carpeta backend y configura las credenciales"
echo "4. Copia env.example a .env en la carpeta frontend"
echo "5. Inicializa el usuario SuperAdmin: cd backend && node scripts/init-admin.js"
echo "6. Inicia el backend: cd backend && npm run dev"
echo "7. Inicia el frontend: cd frontend && npm run dev"
echo ""
echo "🔑 Credenciales por defecto:"
echo "   Usuario: admin"
echo "   Contraseña: Admin123!"
echo ""
echo "📚 Para más información, consulta el README.md"
