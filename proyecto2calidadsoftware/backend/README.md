# Backend - Sistema de Gestión de Productos

## Descripción
Backend seguro para el Sistema de Gestión de Productos implementado con Node.js, Express y PostgreSQL. Incluye todas las medidas de seguridad requeridas para prevenir ataques comunes.

## Características de Seguridad Implementadas

### 🔒 Protección contra SQL Injection
- Uso de parámetros preparados (prepared statements)
- Validación y sanitización de inputs
- No concatenación directa de strings en queries

### 🛡️ Protección contra XSS (Cross-Site Scripting)
- Sanitización de HTML con `sanitize-html`
- Headers de seguridad con Helmet
- Validación de inputs con express-validator

### 🚫 Protección contra Ataques de Fuerza Bruta
- Rate limiting para endpoints de autenticación
- Rate limiting general para todas las rutas
- Bloqueo temporal después de múltiples intentos fallidos

### 🔐 Autenticación y Autorización
- JWT tokens seguros
- Sesiones con timeout de 1 minuto de inactividad
- Control de acceso basado en roles (RBAC)
- Verificación de permisos granular

### 🍪 Cookies Seguras
- HttpOnly flag activado
- SameSite strict
- Cookies con nombres personalizados
- No información sensible en texto plano

### 📊 Logging y Monitoreo
- Logs de todas las operaciones de base de datos
- Logs de autenticación y autorización
- Métricas de rendimiento

## Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de PostgreSQL
├── middleware/
│   └── auth.js              # Middleware de autenticación y autorización
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── users.js             # Gestión de usuarios
│   ├── products.js          # Gestión de productos
│   └── roles.js             # Gestión de roles y permisos
├── scripts/
│   └── init-admin.js        # Script de inicialización
├── server.js                # Servidor principal
├── package.json             # Dependencias
└── README.md                # Este archivo
```

## Instalación

### Prerrequisitos
- Node.js 16+ 
- PostgreSQL 12+
- npm o yarn

### Pasos de Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   # Editar .env con tus credenciales de base de datos
   ```

3. **Ejecutar script de base de datos**
   ```sql
   -- Ejecutar el script SQL proporcionado en PostgreSQL
   ```

4. **Inicializar usuario SuperAdmin**
   ```bash
   node scripts/init-admin.js
   ```

5. **Iniciar servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## Configuración de Variables de Entorno

```env
PORT=4000
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_base_datos
JWT_SECRET=secreto_muy_largo_y_complejo
SESSION_SECRET=otro_secreto_muy_seguro
NODE_ENV=development
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (solo SuperAdmin)
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Información del usuario actual

### Usuarios (requiere autenticación)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario específico
- `POST /api/users` - Crear usuario (solo SuperAdmin)
- `PUT /api/users/:id` - Editar usuario (solo SuperAdmin)
- `DELETE /api/users/:id` - Eliminar usuario (solo SuperAdmin)
- `GET /api/users/:id/permissions` - Permisos de un usuario

### Productos (requiere autenticación)
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto específico
- `POST /api/products` - Crear producto (permiso create)
- `PUT /api/products/:id` - Editar producto (permiso edit)
- `DELETE /api/products/:id` - Eliminar producto (permiso delete)
- `GET /api/products/search/:query` - Buscar productos
- `GET /api/products/stats/summary` - Estadísticas

### Roles (requiere autenticación)
- `GET /api/roles` - Listar roles
- `GET /api/roles/:id` - Obtener rol específico
- `POST /api/roles` - Crear rol (solo SuperAdmin)
- `PUT /api/roles/:id` - Editar rol (solo SuperAdmin)
- `DELETE /api/roles/:id` - Eliminar rol (solo SuperAdmin)
- `POST /api/roles/:id/permissions` - Asignar permisos (solo SuperAdmin)
- `GET /api/roles/:id/permissions` - Permisos de un rol
- `GET /api/roles/available/permissions` - Permisos disponibles

## Sistema de Roles y Permisos

### Roles Predefinidos

1. **SuperAdmin**
   - Todos los permisos
   - Gestión completa de usuarios, roles y productos
   - Asignación de permisos a roles

2. **Auditor**
   - Solo ver listas de usuarios y productos
   - No puede modificar datos

3. **Registrador**
   - Crear, editar y borrar productos
   - Ver lista de usuarios
   - No acceso a gestión de roles y usuarios

### Permisos Disponibles

- `create` - Crear registros
- `edit` - Editar registros
- `delete` - Borrar registros
- `view_reports` - Ver listas y reportes

## Medidas de Seguridad Detalladas

### Headers de Seguridad (Helmet)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Validación de Inputs
- Sanitización de HTML
- Validación de tipos de datos
- Límites de longitud
- Expresiones regulares para formatos específicos

### Rate Limiting
- **General**: 100 requests por 15 minutos
- **Autenticación**: 5 intentos por 15 minutos
- Headers de información sobre límites

### Sesiones Seguras
- Store en PostgreSQL
- Timeout de 1 minuto de inactividad
- Cookies HttpOnly y SameSite strict
- Nombres de cookies personalizados

## Usuarios por Defecto

### SuperAdmin
- **Username**: `admin`
- **Contraseña**: `Admin123!`
- **Rol**: SuperAdmin
- **Permisos**: Todos

⚠️ **IMPORTANTE**: Cambiar la contraseña después del primer login.

## Comandos Útiles

```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start

# Tests
npm test

# Inicializar SuperAdmin
node scripts/init-admin.js
```

## Monitoreo y Logs

El sistema registra automáticamente:
- Conexiones a base de datos
- Queries ejecutadas con tiempo de respuesta
- Intentos de autenticación
- Errores de autorización
- Operaciones CRUD

## Troubleshooting

### Error de Conexión a Base de Datos
1. Verificar credenciales en `.env`
2. Asegurar que PostgreSQL esté ejecutándose
3. Verificar que la base de datos exista

### Error de Autenticación
1. Verificar que el usuario exista
2. Verificar que la contraseña sea correcta
3. Verificar que el rol esté asignado

### Error de Permisos
1. Verificar que el usuario tenga el rol correcto
2. Verificar que el rol tenga los permisos necesarios
3. Verificar que la sesión no haya expirado

## Contribución

1. Seguir las convenciones de código establecidas
2. Implementar tests para nuevas funcionalidades
3. Documentar cambios en la API
4. Verificar que las medidas de seguridad se mantengan

## Licencia

MIT License - Ver archivo LICENSE para más detalles.
