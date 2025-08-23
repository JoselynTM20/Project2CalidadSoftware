const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
require('dotenv').config();

async function initializeAdmin() {
  try {
    console.log('🔐 Inicializando usuario SuperAdmin...');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ El usuario SuperAdmin ya existe');
      return;
    }

    // Obtener el ID del rol SuperAdmin
    const superAdminRole = await query(
      'SELECT id FROM roles WHERE name = $1',
      ['SuperAdmin']
    );

    if (superAdminRole.rows.length === 0) {
      console.error('❌ El rol SuperAdmin no existe. Ejecute primero el script de la base de datos.');
      return;
    }

    const roleId = superAdminRole.rows[0].id;

    // Crear contraseña hasheada
    const password = 'Admin123!'; // Contraseña por defecto
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario SuperAdmin
    const newAdmin = await query(
      'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING id, username',
      ['admin', hashedPassword, roleId]
    );

    console.log('✅ Usuario SuperAdmin creado exitosamente');
    console.log(`   Username: admin`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   ID: ${newAdmin.rows[0].id}`);
    console.log('⚠️  IMPORTANTE: Cambie la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error inicializando SuperAdmin:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeAdmin();
}

module.exports = { initializeAdmin };
