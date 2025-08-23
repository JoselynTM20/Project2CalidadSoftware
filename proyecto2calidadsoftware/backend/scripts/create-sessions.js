const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');
require('dotenv').config();

async function createSessionsTable() {
  try {
    console.log('🗄️  Creando tabla sessions en schema ProductManager...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create-sessions-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
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
        }
      }
    }
    
    console.log('✅ Tabla sessions creada correctamente');
    console.log('🔄 Ahora puedes reiniciar el servidor');
    
  } catch (error) {
    console.error('❌ Error creando la tabla sessions:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSessionsTable();
}

module.exports = { createSessionsTable };
