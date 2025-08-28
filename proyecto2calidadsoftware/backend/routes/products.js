const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { checkResourcePermission } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');

const router = express.Router();

// Función para sanitizar inputs - Permite HTML pero bloquea scripts
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'mark', 'small', 'sub', 'sup'
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'span': ['class'],
      'div': ['class'],
      'p': ['class']
    },
    // Bloquear scripts y eventos peligrosos
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    // Convertir tags peligrosos en texto
    transformTags: {
      'script': function(tagName, attribs) {
        return {
          tagName: 'span',
          text: `<${tagName}>${attribs.text || ''}</${tagName}>`
        };
      },
      'iframe': function(tagName, attribs) {
        return {
          tagName: 'span',
          text: `<${tagName}>${attribs.text || ''}</${tagName}>`
        };
      }
    }
  });
};

// Validaciones para crear/editar productos
const productValidation = [
  body('code')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El código debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('El código solo puede contener letras, números, guiones y guiones bajos'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero no negativo'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número positivo mayor a 0')
];

// GET /api/products - Listar productos (requiere permiso view_products)
router.get('/', checkResourcePermission('products', 'view'), async (req, res) => {
  try {
    const productsResult = await query(
      `SELECT p.id, p.code, p.name, p.description, p.quantity, p.price, 
              p.created_at, u.username as created_by
       FROM products p 
       LEFT JOIN users u ON p.created_by = u.id 
       ORDER BY p.created_at DESC`
    );

    res.json({
      message: 'Productos obtenidos exitosamente',
      products: productsResult.rows
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/products/:id - Obtener producto específico (requiere permiso view_products)
router.get('/:id', checkResourcePermission('products', 'view'), async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await query(
      `SELECT p.id, p.code, p.name, p.description, p.quantity, p.price, 
              p.created_at, u.username as created_by
       FROM products p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto obtenido exitosamente',
      product: productResult.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/products - Crear producto (requiere permiso create_products)
router.post('/', checkResourcePermission('products', 'create'), productValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: errors.array() 
      });
    }

    const { code, name, description, quantity, price } = req.body;

    // Sanitizar inputs
    const sanitizedCode = sanitizeInput(code);
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : null;

    // Verificar si el código ya existe
    const existingProduct = await query(
      'SELECT id FROM products WHERE code = $1',
      [sanitizedCode]
    );

    if (existingProduct.rows.length > 0) {
      return res.status(400).json({ message: 'El código del producto ya existe' });
    }

    // Crear producto
    const newProduct = await query(
      `INSERT INTO products (code, name, description, quantity, price, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, code, name, description, quantity, price, created_at`,
      [sanitizedCode, sanitizedName, sanitizedDescription, quantity, price, req.user.id]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: {
        id: newProduct.rows[0].id,
        code: newProduct.rows[0].code,
        name: newProduct.rows[0].name,
        description: newProduct.rows[0].description,
        quantity: newProduct.rows[0].quantity,
        price: newProduct.rows[0].price,
        createdAt: newProduct.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/products/:id - Editar producto (requiere permiso edit_products)
router.put('/:id', checkResourcePermission('products', 'edit'), productValidation, async (req, res) => {
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
    const { code, name, description, quantity, price } = req.body;

    // Verificar si el producto existe
    const existingProduct = await query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Sanitizar inputs
    const sanitizedCode = code ? sanitizeInput(code) : null;
    const sanitizedName = name ? sanitizeInput(name) : null;
    const sanitizedDescription = description !== undefined ? (description ? sanitizeInput(description) : null) : undefined;

    // Verificar si el nuevo código ya existe (excluyendo el producto actual)
    if (code) {
      const codeExists = await query(
        'SELECT id FROM products WHERE code = $1 AND id != $2',
        [sanitizedCode, id]
      );

      if (codeExists.rows.length > 0) {
        return res.status(400).json({ message: 'El código del producto ya existe' });
      }
    }

    // Construir query de actualización
    let updateQuery = 'UPDATE products SET';
    const updateParams = [];
    let paramCount = 1;

    let hasFields = false;

    if (code) {
      if (hasFields) updateQuery += ',';
      updateQuery += ` code = $${paramCount}`;
      updateParams.push(sanitizedCode);
      paramCount++;
      hasFields = true;
    }

    if (name) {
      if (hasFields) updateQuery += ',';
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

    if (quantity !== undefined) {
      if (hasFields) updateQuery += ',';
      updateQuery += ` quantity = $${paramCount}`;
      updateParams.push(quantity);
      paramCount++;
      hasFields = true;
    }

    if (price !== undefined) {
      if (hasFields) updateQuery += ',';
      updateQuery += ` price = $${paramCount}`;
      updateParams.push(price);
      paramCount++;
      hasFields = true;
    }

    // Si no hay campos para actualizar, retornar error
    if (!hasFields) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING id, code, name, description, quantity, price, created_at`;
    updateParams.push(id);

    // Ejecutar actualización
    const updatedProduct = await query(updateQuery, updateParams);

    res.json({
      message: 'Producto actualizado exitosamente',
      product: {
        id: updatedProduct.rows[0].id,
        code: updatedProduct.rows[0].code,
        name: updatedProduct.rows[0].name,
        description: updatedProduct.rows[0].description,
        quantity: updatedProduct.rows[0].quantity,
        price: updatedProduct.rows[0].price,
        createdAt: updatedProduct.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/products/:id - Eliminar producto (requiere permiso delete_products)
router.delete('/:id', checkResourcePermission('products', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el producto existe
    const existingProduct = await query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar producto
    await query('DELETE FROM products WHERE id = $1', [id]);

    res.json({ message: 'Producto eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/products/search/:query - Buscar productos (requiere permiso view_products)
router.get('/search/:query', checkResourcePermission('products', 'view'), async (req, res) => {
  try {
    const { query: searchQuery } = req.params;

    // Sanitizar query de búsqueda
    const sanitizedQuery = sanitizeInput(searchQuery);

    const productsResult = await query(
      `SELECT p.id, p.code, p.name, p.description, p.quantity, p.price, 
              p.created_at, u.username as created_by
       FROM products p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.code ILIKE $1 OR p.name ILIKE $1 OR p.description ILIKE $1
       ORDER BY p.created_at DESC`,
      [`%${sanitizedQuery}%`]
    );

    res.json({
      message: 'Búsqueda completada exitosamente',
      query: sanitizedQuery,
      products: productsResult.rows
    });

  } catch (error) {
    console.error('Error buscando productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/products/stats/summary - Estadísticas de productos (requiere permiso view_products)
router.get('/stats/summary', checkResourcePermission('products', 'view'), async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(quantity) as total_quantity,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM products
    `);

    const lowStockResult = await query(`
      SELECT COUNT(*) as low_stock_count
      FROM products 
      WHERE quantity < 10
    `);

    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      stats: {
        ...statsResult.rows[0],
        lowStockCount: lowStockResult.rows[0].low_stock_count
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
