const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { isSuperAdmin, checkPermission } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');

const router = express.Router();

// Función para sanitizar inputs
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
};

// Validaciones para crear/editar usuarios
const userValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  body('roleId')
    .isInt({ min: 1 })
    .withMessage('El ID del rol debe ser un número entero válido')
];

// GET /api/users - Listar usuarios (requiere permiso view_reports)
router.get('/', checkPermission('view_reports'), async (req, res) => {
  try {
    const usersResult = await query(
      `SELECT u.id, u.username, u.role_id, r.name as role_name, u.last_login, u.created_at
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       ORDER BY u.created_at DESC`
    );

    res.json({
      message: 'Usuarios obtenidos exitosamente',
      users: usersResult.rows
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/users/:id - Obtener usuario específico (requiere permiso view_reports)
router.get('/:id', checkPermission('view_reports'), async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      `SELECT u.id, u.username, u.role_id, r.name as role_name, u.last_login, u.created_at
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario obtenido exitosamente',
      user: userResult.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/users - Crear usuario (solo SuperAdmin)
router.post('/', isSuperAdmin, userValidation, async (req, res) => {
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
      'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING id, username, role_id, created_at',
      [sanitizedUsername, hashedPassword, roleId]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        roleId: newUser.rows[0].role_id,
        createdAt: newUser.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/users/:id - Editar usuario (solo SuperAdmin)
router.put('/:id', isSuperAdmin, userValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { username, password, roleId } = req.body;

    // Verificar si el usuario existe
    const existingUser = await query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Sanitizar inputs
    const sanitizedUsername = sanitizeInput(username);

    // Verificar si el nuevo username ya existe (excluyendo el usuario actual)
    if (username) {
      const usernameExists = await query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [sanitizedUsername, id]
      );

      if (usernameExists.rows.length > 0) {
        return res.status(400).json({ message: 'El nombre de usuario ya existe' });
      }
    }

    // Verificar si el rol existe
    if (roleId) {
      const roleExists = await query(
        'SELECT id FROM roles WHERE id = $1',
        [roleId]
      );

      if (roleExists.rows.length === 0) {
        return res.status(400).json({ message: 'El rol especificado no existe' });
      }
    }

    // Construir query de actualización
    let updateQuery = 'UPDATE users SET';
    const updateParams = [];
    let paramCount = 1;

    let hasFields = false;

    if (username) {
      if (hasFields) updateQuery += ',';
      updateQuery += ` username = $${paramCount}`;
      updateParams.push(sanitizedUsername);
      paramCount++;
      hasFields = true;
    }

    if (password) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      if (hasFields) updateQuery += ',';
      updateQuery += ` password = $${paramCount}`;
      updateParams.push(hashedPassword);
      paramCount++;
      hasFields = true;
    }

    if (roleId) {
      if (hasFields) updateQuery += ',';
      updateQuery += ` role_id = $${paramCount}`;
      updateParams.push(roleId);
      paramCount++;
      hasFields = true;
    }

    // Si no hay campos para actualizar, retornar error
    if (!hasFields) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING id, username, role_id, created_at`;
    updateParams.push(id);

    // Ejecutar actualización
    const updatedUser = await query(updateQuery, updateParams);

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: updatedUser.rows[0].id,
        username: updatedUser.rows[0].username,
        roleId: updatedUser.rows[0].role_id,
        createdAt: updatedUser.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (solo SuperAdmin)
router.delete('/:id', isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const existingUser = await query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que no se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }

    // Eliminar usuario
    await query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/users/:id/permissions - Obtener permisos de un usuario
router.get('/:id/permissions', checkPermission('view_reports'), async (req, res) => {
  try {
    const { id } = req.params;

    const permissionsResult = await query(
      `SELECT p.name, p.description
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN users u ON u.role_id = rp.role_id
       WHERE u.id = $1`,
      [id]
    );

    res.json({
      message: 'Permisos obtenidos exitosamente',
      permissions: permissionsResult.rows
    });

  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
