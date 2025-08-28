const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const sanitizeHtml = require('sanitize-html');

const router = express.Router();

// Validaciones para el login
const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para el registro
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  body('roleId')
    .isInt({ min: 1 })
    .withMessage('El ID del rol debe ser un número entero válido')
];

// Función para sanitizar inputs
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
};

// POST /api/auth/login - Iniciar sesión
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Sanitizar inputs
    const sanitizedUsername = sanitizeInput(username);

    // Buscar usuario en la base de datos
    const userResult = await query(
      `SELECT u.id, u.username, u.password, u.role_id, r.name as role_name
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = $1`,
      [sanitizedUsername]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Obtener permisos del usuario
    const permissionsResult = await query(
      `SELECT p.name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [user.role_id]
    );

    const permissions = permissionsResult.rows.map(row => row.name);

    // Crear token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        roleId: user.role_id,
        roleName: user.role_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expira en 1 hora
    );

    // Actualizar último login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Configurar sesión
    req.session.userId = user.id;
    req.session.roleId = user.role_id;

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        roleId: user.role_id,
        roleName: user.role_name,
        permissions
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/auth/register - Registrar nuevo usuario (solo SuperAdmin)
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: errors.array() 
      });
    }

    const { username, password, roleId } = req.body;

    // Sanitizar inputs
    const sanitizedUsername = sanitizeInput(username);

    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [sanitizedUsername]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    // Verificar si el rol existe
    const roleExists = await query(
      'SELECT id FROM roles WHERE id = $1',
      [roleId]
    );

    if (roleExists.rows.length === 0) {
      return res.status(400).json({ message: 'El rol especificado no existe' });
    }

    // Hashear contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = await query(
      'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING id, username, role_id',
      [sanitizedUsername, hashedPassword, roleId]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        roleId: newUser.rows[0].role_id
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
  try {
    // Destruir sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destruyendo sesión:', err);
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
      
      res.clearCookie('sessionId');
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No hay sesión activa' });
    }

    const userResult = await query(
      `SELECT u.id, u.username, u.role_id, r.name as role_name, u.last_login
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [req.session.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Obtener permisos del usuario
    const permissionsResult = await query(
      `SELECT p.name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [user.role_id]
    );

    const permissions = permissionsResult.rows.map(row => row.name);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        roleId: user.role_id,
        roleName: user.role_name,
        lastLogin: user.last_login,
        permissions
      }
    });

  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
