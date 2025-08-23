@echo off
REM Script de instalación para el Sistema de Gestión de Productos
REM Proyecto de Calidad de Software - UTN

echo 🚀 Instalando Sistema de Gestión de Productos...
echo ================================================

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 16+ primero.
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado. Por favor instala npm primero.
    pause
    exit /b 1
)

echo ✅ Node.js y npm verificados

REM Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)

echo ✅ Backend instalado correctamente

REM Instalar dependencias del frontend
echo 📦 Instalando dependencias del frontend...
cd ..\frontend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo ✅ Frontend instalado correctamente

REM Volver al directorio raíz
cd ..

echo.
echo 🎉 ¡Instalación completada exitosamente!
echo.
echo 📋 Próximos pasos:
echo 1. Configura tu base de datos PostgreSQL
echo 2. Ejecuta el script SQL proporcionado
echo 3. Copia env.example a .env en la carpeta backend y configura las credenciales
echo 4. Copia env.example a .env en la carpeta frontend
echo 5. Inicializa el usuario SuperAdmin: cd backend ^&^& node scripts/init-admin.js
echo 6. Inicia el backend: cd backend ^&^& npm run dev
echo 7. Inicia el frontend: cd frontend ^&^& npm run dev
echo.
echo 🔑 Credenciales por defecto:
echo    Usuario: admin
echo    Contraseña: Admin123!
echo.
echo 📚 Para más información, consulta el README.md
pause
