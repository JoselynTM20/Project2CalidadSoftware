const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkPermissions() {
  try {
    // Establecer el schema
    await pool.query('SET search_path TO "ProductManager"');
    
    // Verificar permisos existentes
    const permissionsResult = await pool.query('SELECT id, name, description FROM permissions ORDER BY name');
    
    console.log('🔍 Permisos existentes en la base de datos:');
    console.log('==========================================');
    
    permissionsResult.rows.forEach(permission => {
      console.log(`ID: ${permission.id} | Nombre: "${permission.name}" | Descripción: ${permission.description}`);
    });
    
    // Verificar permisos del rol Auditor
    const auditorPermissionsResult = await pool.query(`
      SELECT p.name 
      FROM permissions p 
      JOIN role_permissions rp ON p.id = rp.permission_id 
      JOIN roles r ON rp.role_id = r.id 
      WHERE r.name = 'Auditor'
      ORDER BY p.name
    `);
    
    console.log('\n🔍 Permisos del rol "Auditor":');
    console.log('================================');
    
    auditorPermissionsResult.rows.forEach(row => {
      console.log(`• "${row.name}"`);
    });
    
    // Verificar todos los roles y sus permisos
    const rolesPermissionsResult = await pool.query(`
      SELECT r.name as role_name, p.name as permission_name
      FROM roles r 
      LEFT JOIN role_permissions rp ON r.id = rp.role_id 
      LEFT JOIN permissions p ON rp.permission_id = p.id 
      ORDER BY r.name, p.name
    `);
    
    console.log('\n🔍 Todos los roles y sus permisos:');
    console.log('====================================');
    
    let currentRole = '';
    rolesPermissionsResult.rows.forEach(row => {
      if (row.role_name !== currentRole) {
        currentRole = row.role_name;
        console.log(`\n📋 Rol: ${currentRole}`);
      }
      if (row.permission_name) {
        console.log(`  • ${row.permission_name}`);
      } else {
        console.log(`  • Sin permisos`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkPermissions();
