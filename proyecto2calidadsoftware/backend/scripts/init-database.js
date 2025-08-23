const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🗄️  Inicializando base de datos ProductManager...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir el SQL en comandos individuales de manera más inteligente
    const commands = sqlContent
      .split(/(?<=;)\s*(?=\n)/)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('COMMENT'));
    
    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
    
    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await query(command);
          console.log(`✅ Comando ${i + 1} ejecutado`);
        } catch (error) {
          console.error(`❌ Error en comando ${i + 1}:`, error.message);
          // Continuar con el siguiente comando
        }
      }
    }
    
    console.log('✅ Base de datos inicializada correctamente');
    console.log('🔐 Ahora puedes ejecutar: npm run init-admin');
    
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
