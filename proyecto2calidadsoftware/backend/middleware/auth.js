const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener información del usuario desde la base de datos
    const userResult = await query(
      `SELECT u.id, u.username, u.role_id, r.name as role_name, u.last_login
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    
    // Actualizar último login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: user.role_name,
      lastLogin: user.last_login
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Middleware para verificar permisos específicos
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      // Verificar si el usuario tiene el permiso requerido
      const permissionResult = await query(
        `SELECT COUNT(*) as count
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = $1 AND p.name = $2`,
        [req.user.roleId, requiredPermission]
      );

      if (parseInt(permissionResult.rows[0].count) === 0) {
        return res.status(403).json({ 
          message: 'No tienes permisos para realizar esta acción',
          requiredPermission,
          userRole: req.user.roleName
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
};

// Middleware para verificar si es SuperAdmin
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (req.user.roleName !== 'SuperAdmin') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo SuperAdmin puede realizar esta acción',
        userRole: req.user.roleName
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando SuperAdmin:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Middleware para verificar si es Auditor
const isAuditor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (req.user.roleName !== 'Auditor') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo Auditores pueden realizar esta acción',
        userRole: req.user.roleName
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando Auditor:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Middleware para verificar si es Registrador
const isRegistrador = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (req.user.roleName !== 'Registrador') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Solo Registradores pueden realizar esta acción',
        userRole: req.user.roleName
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando Registrador:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  authenticateToken,
  checkPermission,
  isSuperAdmin,
  isAuditor,
  isRegistrador
};
