const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { isSuperAdmin, checkResourcePermission, checkViewOnlyPermission } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');

const router = express.Router();

// Función para sanitizar inputs
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
};

// Validaciones para crear/editar roles
const roleValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre del rol debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('El nombre del rol solo puede contener letras, números y espacios'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
];

// Validaciones para asignar permisos
const permissionAssignmentValidation = [
  body('permissionIds')
    .isArray()
    .withMessage('Los IDs de permisos deben ser un array')
    .notEmpty()
    .withMessage('Debe seleccionar al menos un permiso'),
  body('permissionIds.*')
    .isInt({ min: 1 })
    .withMessage('Cada ID de permiso debe ser un número entero válido')
];

// GET /api/roles - Listar roles (requiere permiso view_roles)
router.get('/', checkResourcePermission('roles', 'view'), async (req, res) => {
  try {
    const rolesResult = await query(
      `SELECT r.id, r.name, r.description, r.created_at,
              COUNT(u.id) as user_count
       FROM roles r 
       LEFT JOIN users u ON r.id = u.role_id 
       GROUP BY r.id, r.name, r.description, r.created_at
       ORDER BY r.created_at DESC`
    );

    // Obtener permisos para cada rol
    const rolesWithPermissions = await Promise.all(
      rolesResult.rows.map(async (role) => {
        const permissionsResult = await query(
          `SELECT p.id, p.name, p.description
           FROM permissions p
           JOIN role_permissions rp ON p.id = rp.permission_id
           WHERE rp.role_id = $1`,
          [role.id]
        );
        
        return {
          ...role,
          permissions: permissionsResult.rows
        };
      })
    );

    res.json({
      message: 'Roles obtenidos exitosamente',
      roles: rolesWithPermissions
    });

  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/roles/available/permissions - Obtener todos los permisos disponibles
router.get('/available/permissions', checkResourcePermission('roles', 'view'), async (req, res) => {
  try {
    const permissionsResult = await query(
      'SELECT id, name, description FROM permissions ORDER BY name'
    );

    res.json({
      message: 'Permisos disponibles obtenidos exitosamente',
      permissions: permissionsResult.rows
    });

  } catch (error) {
    console.error('Error obteniendo permisos disponibles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/roles/:id - Obtener rol específico (requiere permiso view_roles)
router.get('/:id', checkResourcePermission('roles', 'view'), async (req, res) => {
  try {
    const { id } = req.params;

    const roleResult = await query(
      `SELECT r.id, r.name, r.description, r.created_at,
              COUNT(u.id) as user_count
       FROM roles r 
       LEFT JOIN users u ON r.id = u.role_id 
       WHERE r.id = $1
       GROUP BY r.id, r.name, r.description, r.created_at`,
      [id]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Obtener permisos del rol
    const permissionsResult = await query(
      `SELECT p.id, p.name, p.description
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [id]
    );

    const role = roleResult.rows[0];
    role.permissions = permissionsResult.rows;

    res.json({
      message: 'Rol obtenido exitosamente',
      role
    });

  } catch (error) {
    console.error('Error obteniendo rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/roles - Crear rol (requiere permiso create_roles)
router.post('/', checkResourcePermission('roles', 'create'), roleValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: errors.array() 
      });
    }

    const { name, description } = req.body;

    // Sanitizar inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : null;

    // Verificar si el rol ya existe
    const existingRole = await query(
      'SELECT id FROM roles WHERE name = $1',
      [sanitizedName]
    );

    if (existingRole.rows.length > 0) {
      return res.status(400).json({ message: 'El nombre del rol ya existe' });
    }

    // Crear rol
    const newRole = await query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at',
      [sanitizedName, sanitizedDescription]
    );

    res.status(201).json({
      message: 'Rol creado exitosamente',
      role: {
        id: newRole.rows[0].id,
        name: newRole.rows[0].name,
        description: newRole.rows[0].description,
        createdAt: newRole.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error creando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/roles/:id - Editar rol (requiere permiso edit_roles)
router.put('/:id', checkResourcePermission('roles', 'edit'), roleValidation, async (req, res) => {
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
    const { name, description } = req.body;

    // Verificar si el rol existe
    const existingRole = await query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (existingRole.rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Sanitizar inputs
    const sanitizedName = name ? sanitizeInput(name) : null;
    const sanitizedDescription = description !== undefined ? (description ? sanitizeInput(description) : null) : undefined;

    // Verificar si el nuevo nombre ya existe (excluyendo el rol actual)
    if (name) {
      const nameExists = await query(
        'SELECT id FROM roles WHERE name = $1 AND id != $2',
        [sanitizedName, id]
      );

      if (nameExists.rows.length > 0) {
        return res.status(400).json({ message: 'El nombre del rol ya existe' });
      }
    }

    // Construir query de actualización
    let updateQuery = 'UPDATE roles SET';
    const updateParams = [];
    let paramCount = 1;
    let hasFields = false;

    if (name) {
      updateQuery += ` name = $${paramCount}`;
      updateParams.push(sanitizedName);
      paramCount++;
      hasFields = true;
    }

    if (description !== undefined) {
      if (hasFields) updateQuery += ',';
      updateQuery += ` description = $${paramCount}`;
      updateParams.push(sanitizedDescription);
      paramCount++;
      hasFields = true;
    }

    // Si no hay campos para actualizar, retornar error
    if (!hasFields) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING id, name, description, created_at`;
    updateParams.push(id);

    // Ejecutar actualización
    const updatedRole = await query(updateQuery, updateParams);

    res.json({
      message: 'Rol actualizado exitosamente',
      role: {
        id: updatedRole.rows[0].id,
        name: updatedRole.rows[0].name,
        description: updatedRole.rows[0].description,
        createdAt: updatedRole.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/roles/:id - Eliminar rol (solo SuperAdmin)
router.delete('/:id', isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el rol existe
    const existingRole = await query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (existingRole.rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Verificar si hay usuarios usando este rol
    const usersWithRole = await query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = $1',
      [id]
    );

    if (parseInt(usersWithRole.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el rol porque hay usuarios asignados a él' 
      });
    }

    // Eliminar rol (esto también eliminará las asignaciones de permisos por CASCADE)
    await query('DELETE FROM roles WHERE id = $1', [id]);

    res.json({ message: 'Rol eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/roles/:id/permissions - Asignar permisos a un rol (solo SuperAdmin)
router.post('/:id/permissions', isSuperAdmin, permissionAssignmentValidation, async (req, res) => {
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
    const { permissionIds } = req.body;

    // Verificar si el rol existe
    const existingRole = await query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (existingRole.rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Verificar que todos los permisos existan
    const permissionIdsStr = permissionIds.join(',');
    const permissionsExist = await query(
      `SELECT COUNT(*) as count FROM permissions WHERE id IN (${permissionIdsStr})`
    );

    if (parseInt(permissionsExist.rows[0].count) !== permissionIds.length) {
      return res.status(400).json({ message: 'Uno o más permisos no existen' });
    }

    // Eliminar permisos actuales del rol
    await query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

    // Asignar nuevos permisos
    for (const permissionId of permissionIds) {
      await query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [id, permissionId]
      );
    }

    res.json({ 
      message: 'Permisos asignados exitosamente al rol',
      roleId: id,
      permissionIds
    });

  } catch (error) {
    console.error('Error asignando permisos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/roles/:id/permissions - Obtener permisos de un rol
router.get('/:id/permissions', checkResourcePermission('roles', 'view'), async (req, res) => {
  try {
    const { id } = req.params;

    const permissionsResult = await query(
      `SELECT p.id, p.name, p.description
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [id]
    );

    res.json({
      message: 'Permisos del rol obtenidos exitosamente',
      roleId: id,
      permissions: permissionsResult.rows
    });

  } catch (error) {
    console.error('Error obteniendo permisos del rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/roles/:id/permissions - Actualizar permisos de un rol (solo SuperAdmin)
router.put('/:id/permissions', isSuperAdmin, permissionAssignmentValidation, async (req, res) => {
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
    const { permissionIds } = req.body;

    // Verificar si el rol existe
    const existingRole = await query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (existingRole.rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Verificar que todos los permisos existan
    const permissionIdsStr = permissionIds.join(',');
    const permissionsExist = await query(
      `SELECT COUNT(*) as count FROM permissions WHERE id IN (${permissionIdsStr})`
    );

    if (parseInt(permissionsExist.rows[0].count) !== permissionIds.length) {
      return res.status(400).json({ message: 'Uno o más permisos no existen' });
    }

    // Obtener usuarios afectados por este cambio
    const affectedUsers = await query(
      'SELECT id, username FROM users WHERE role_id = $1',
      [id]
    );

    // Eliminar permisos actuales del rol
    await query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

    // Asignar nuevos permisos
    for (const permissionId of permissionIds) {
      await query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [id, permissionId]
      );
    }

    // Obtener los nombres de los permisos para la respuesta
    const permissionNames = await query(
      `SELECT name FROM permissions WHERE id IN (${permissionIdsStr}) ORDER BY name`
    );

    // Obtener permisos anteriores para comparar
    const previousPermissions = await query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [id]
    );

    // Crear lista de permisos anteriores
    const previousPermissionNames = previousPermissions.rows.map(p => p.name);

    res.json({ 
      message: 'Permisos del rol actualizados exitosamente',
      roleId: id,
      roleName: existingRole.rows[0].name,
      permissionIds,
      permissionNames: permissionNames.rows.map(p => p.name),
      previousPermissions: previousPermissionNames,
      affectedUsers: affectedUsers.rows.length,
      warning: `⚠️ Los ${affectedUsers.rows.length} usuarios con este rol deberán volver a iniciar sesión para que los nuevos permisos se activen.`,
      actionRequired: 'Los usuarios afectados deben cerrar sesión y volver a iniciar para ver los cambios.'
    });

  } catch (error) {
    console.error('Error actualizando permisos del rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
