# Sistema de Gestión de Productos - Proyecto de Calidad de Software

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema completo de gestión de productos con enfoque en **seguridad en el software** y **prevención de vulnerabilidades**. El sistema incluye un backend robusto con Node.js/Express y un frontend moderno con React/TypeScript.

## 🎯 Objetivos

- Aplicar conocimientos relacionados a seguridad en el software y vulnerabilidades
- Implementar un sistema de gestión de productos con control de acceso basado en roles
- Demostrar medidas de seguridad contra ataques comunes (SQL Injection, XSS, etc.)
- Crear una aplicación web completa con base de datos relacional

## 🏗️ Arquitectura del Sistema

```
proyecto2calidadsoftware/
├── backend/                 # API REST con Node.js + Express
│   ├── config/             # Configuración de base de datos
│   ├── middleware/         # Middleware de autenticación y autorización
│   ├── routes/             # Rutas de la API
│   ├── scripts/            # Scripts de inicialización
│   └── server.js           # Servidor principal
├── frontend/               # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios de API
│   │   ├── stores/         # Estado global (Zustand)
│   │   └── types/          # Tipos TypeScript
│   └── package.json
└── README.md               # Este archivo
```

## 🔒 Medidas de Seguridad Implementadas

### Protección contra SQL Injection
- ✅ Uso de parámetros preparados (prepared statements)
- ✅ Validación y sanitización de inputs
- ✅ No concatenación directa de strings en queries

### Protección contra XSS (Cross-Site Scripting)
- ✅ Sanitización de HTML con `sanitize-html`
- ✅ Headers de seguridad con Helmet
- ✅ Validación de inputs con express-validator

### Protección contra Ataques de Fuerza Bruta
- ✅ Rate limiting para endpoints de autenticación
- ✅ Rate limiting general para todas las rutas
- ✅ Bloqueo temporal después de múltiples intentos fallidos

### Autenticación y Autorización
- ✅ JWT tokens seguros
- ✅ Sesiones con timeout de 1 minuto de inactividad
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Verificación de permisos granular

### Cookies Seguras
- ✅ HttpOnly flag activado
- ✅ SameSite strict
- ✅ Cookies con nombres personalizados
- ✅ No información sensible en texto plano

## 👥 Sistema de Roles y Permisos

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

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 16+ 
- **PostgreSQL** 12+
- **npm** o **yarn**

### 1. Configurar Base de Datos

```sql
-- Ejecutar el script SQL proporcionado en PostgreSQL
-- El script crea las tablas, roles, permisos y usuario SuperAdmin
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp env.example .env
# Editar .env con tus credenciales de base de datos
```

### 3. Inicializar Usuario SuperAdmin

```bash
cd backend
node scripts/init-admin.js
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

### 5. Variables de Entorno

#### Backend (.env)
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

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
```

## 🏃‍♂️ Ejecutar el Proyecto

### Backend
```bash
cd backend
npm run dev    # Desarrollo
npm start      # Producción
```

### Frontend
```bash
cd frontend
npm run dev    # Desarrollo
npm run build  # Producción
npm run preview # Vista previa de producción
```

## 🔑 Credenciales por Defecto

### SuperAdmin
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`
- **Rol**: SuperAdmin
- **Permisos**: Todos

⚠️ **IMPORTANTE**: Cambiar la contraseña después del primer login.

## 📱 Características del Frontend

- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **React Query** para gestión de estado del servidor
- **Zustand** para estado global
- **React Hook Form** para formularios
- **Lucide React** para iconos
- **Responsive design** para móviles y desktop

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (solo SuperAdmin)
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Información del usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario específico
- `POST /api/users` - Crear usuario (solo SuperAdmin)
- `PUT /api/users/:id` - Editar usuario (solo SuperAdmin)
- `DELETE /api/users/:id` - Eliminar usuario (solo SuperAdmin)

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto específico
- `POST /api/products` - Crear producto (permiso create)
- `PUT /api/products/:id` - Editar producto (permiso edit)
- `DELETE /api/products/:id` - Eliminar producto (permiso delete)
- `GET /api/products/search/:query` - Buscar productos
- `GET /api/products/stats/summary` - Estadísticas

### Roles
- `GET /api/roles` - Listar roles
- `GET /api/roles/:id` - Obtener rol específico
- `POST /api/roles` - Crear rol (solo SuperAdmin)
- `PUT /api/roles/:id` - Editar rol (solo SuperAdmin)
- `DELETE /api/roles/:id` - Eliminar rol (solo SuperAdmin)

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📊 Monitoreo y Logs

El sistema registra automáticamente:
- Conexiones a base de datos
- Queries ejecutadas con tiempo de respuesta
- Intentos de autenticación
- Errores de autorización
- Operaciones CRUD

## 🚨 Troubleshooting

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

## 📚 Documentación Adicional

- [Backend README](./backend/README.md) - Documentación detallada del backend
- [Frontend README](./frontend/README.md) - Documentación del frontend
- [Script SQL](./database-script.sql) - Script de configuración de base de datos

## 🤝 Contribución

1. Seguir las convenciones de código establecidas
2. Implementar tests para nuevas funcionalidades
3. Documentar cambios en la API
4. Verificar que las medidas de seguridad se mantengan

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 👨‍💻 Equipo

- **Proyecto de Calidad de Software**
- **Universidad Tecnológica Nacional**
- **Fecha de entrega**: 27 de Agosto del 2025

---

## 🎉 ¡Proyecto Completado!

Este sistema demuestra la implementación de **mejores prácticas de seguridad** en el desarrollo de software, incluyendo:

- ✅ Protección contra vulnerabilidades comunes
- ✅ Sistema de autenticación y autorización robusto
- ✅ Control de acceso basado en roles
- ✅ Validación y sanitización de inputs
- ✅ Headers de seguridad
- ✅ Rate limiting
- ✅ Logging y monitoreo
- ✅ Interfaz de usuario moderna y responsive

El proyecto cumple con todos los requerimientos especificados en el documento de proyecto y está listo para ser evaluado.
