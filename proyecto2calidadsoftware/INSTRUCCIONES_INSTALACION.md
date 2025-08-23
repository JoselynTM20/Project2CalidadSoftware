# 📋 Instrucciones de Instalación - Sistema de Gestión de Productos

## 🎯 Objetivo
Este documento proporciona instrucciones paso a paso para instalar y configurar el Sistema de Gestión de Productos en tu entorno local.

## 📋 Prerrequisitos

### Software Requerido
- **Node.js** versión 16 o superior
- **PostgreSQL** versión 12 o superior
- **npm** o **yarn** (incluido con Node.js)

### Verificar Instalaciones
```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar PostgreSQL
psql --version
```

## 🚀 Instalación Automatizada (Recomendada)

### Para Linux/macOS:
```bash
chmod +x install.sh
./install.sh
```

### Para Windows:
```cmd
install.bat
```

## 🔧 Instalación Manual

### Paso 1: Configurar Base de Datos PostgreSQL

1. **Iniciar PostgreSQL**
   ```bash
   # En Windows, iniciar el servicio desde Servicios
   # En Linux/macOS:
   sudo systemctl start postgresql
   ```

2. **Crear Base de Datos**
   ```sql
   -- Conectarse a PostgreSQL como superusuario
   psql -U postgres
   
   -- Crear base de datos
   CREATE DATABASE productmanager;
   
   -- Conectarse a la base de datos
   \c productmanager;
   ```

3. **Ejecutar Script SQL**
   ```sql
   -- Copiar y pegar el contenido del script SQL proporcionado
   -- Este script crea todas las tablas, roles, permisos y usuario inicial
   ```

### Paso 2: Configurar Backend

1. **Navegar al directorio del backend**
   ```bash
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar archivo de ejemplo
   cp env.example .env
   
   # Editar .env con tus credenciales
   nano .env  # o usar tu editor preferido
   ```

4. **Configuración del archivo .env**
   ```env
   PORT=4000
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=productmanager
   JWT_SECRET=un_secreto_muy_largo_y_complejo_para_produccion
   SESSION_SECRET=otro_secreto_muy_seguro_para_sesiones
   NODE_ENV=development
   ```

5. **Inicializar usuario SuperAdmin**
   ```bash
   node scripts/init-admin.js
   ```

### Paso 3: Configurar Frontend

1. **Navegar al directorio del frontend**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar archivo de ejemplo
   cp env.example .env
   
   # Editar .env
   nano .env
   ```

4. **Configuración del archivo .env**
   ```env
   VITE_API_URL=http://localhost:4000/api
   VITE_APP_TITLE=Sistema de Gestión de Productos
   VITE_APP_VERSION=1.0.0
   ```

## 🏃‍♂️ Ejecutar el Sistema

### Iniciar Backend
```bash
cd backend
npm run dev    # Desarrollo con nodemon
# o
npm start      # Producción
```

El backend estará disponible en: `http://localhost:4000`

### Iniciar Frontend
```bash
cd frontend
npm run dev    # Desarrollo
# o
npm run build  # Construir para producción
npm run preview # Vista previa de producción
```

El frontend estará disponible en: `http://localhost:3000`

## 🔑 Acceso al Sistema

### Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`
- **Rol**: SuperAdmin
- **Permisos**: Todos

⚠️ **IMPORTANTE**: Cambiar la contraseña después del primer login.

## 🧪 Verificar Instalación

### 1. Verificar Backend
```bash
# Verificar que el servidor esté ejecutándose
curl http://localhost:4000/api/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Sistema de Gestión de Productos funcionando correctamente",
  "timestamp": "2025-01-XX..."
}
```

### 2. Verificar Base de Datos
```sql
-- Conectarse a PostgreSQL
psql -U postgres -d productmanager

-- Verificar tablas creadas
\dt

-- Verificar usuario admin
SELECT username, role_id FROM users WHERE username = 'admin';
```

### 3. Verificar Frontend
- Abrir `http://localhost:3000` en el navegador
- Deberías ver la página de login
- Probar login con credenciales por defecto

## 🚨 Solución de Problemas

### Error: "Cannot connect to database"
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que la base de datos exista
4. Verificar que el puerto 5432 esté disponible

### Error: "Module not found"
1. Verificar que `npm install` se ejecutó correctamente
2. Verificar que estás en el directorio correcto
3. Eliminar `node_modules` y ejecutar `npm install` nuevamente

### Error: "Port already in use"
1. Cambiar puerto en `.env` del backend
2. Actualizar `VITE_API_URL` en el frontend
3. Verificar que no haya otros servicios usando el puerto

### Error: "Permission denied" en scripts
```bash
# En Linux/macOS
chmod +x install.sh
```

## 📱 Acceso desde Otros Dispositivos

### En la misma red local:
1. Obtener IP de tu máquina: `ipconfig` (Windows) o `ifconfig` (Linux/macOS)
2. Actualizar `VITE_API_URL` en el frontend: `http://TU_IP:4000/api`
3. Acceder desde `http://TU_IP:3000`

### Configurar CORS (si es necesario):
En `backend/server.js`, actualizar la configuración de CORS:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://TU_IP:3000'],
  credentials: true
}));
```

## 🔒 Consideraciones de Seguridad

### Para Producción:
1. Cambiar todas las contraseñas por defecto
2. Usar secretos JWT más complejos
3. Configurar HTTPS
4. Restringir acceso a la base de datos
5. Configurar firewall
6. Usar variables de entorno seguras

### Variables de Entorno Críticas:
- `JWT_SECRET`: Debe ser muy largo y complejo
- `SESSION_SECRET`: Debe ser único y seguro
- `DB_PASSWORD`: Contraseña fuerte de base de datos

## 📚 Recursos Adicionales

- [README Principal](./README.md)
- [Documentación del Backend](./backend/README.md)
- [Documentación del Frontend](./frontend/README.md)
- [Script SQL de Base de Datos](./database-script.sql)

## 🆘 Soporte

Si encuentras problemas durante la instalación:

1. Verificar que todos los prerrequisitos estén instalados
2. Revisar los logs de error en la consola
3. Verificar la configuración de variables de entorno
4. Consultar la documentación adicional
5. Verificar que los puertos no estén ocupados

---

## 🎉 ¡Instalación Completada!

Una vez que hayas seguido todos los pasos, tendrás un sistema completo de gestión de productos funcionando con todas las medidas de seguridad implementadas.

**¡El sistema está listo para usar!** 🚀
