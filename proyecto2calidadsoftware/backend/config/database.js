const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos con medidas de seguridad
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Configuraciones de seguridad para la conexión
  connectionTimeoutMillis: 10000, // 10 segundos
  idleTimeoutMillis: 30000, // 30 segundos
  max: 20, // máximo 20 conexiones en el pool
  min: 2,  // mínimo 2 conexiones en el pool
  // Configuración para prevenir SQL injection
  statement_timeout: 30000, // 30 segundos máximo por query
  query_timeout: 30000, // 30 segundos máximo por query
});


// Función para ejecutar queries de forma segura
const query = async (text, params) => {
  const start = Date.now();
  try {
    // Establecer el schema ProductManager por defecto
    await pool.query('SET search_path TO "ProductManager"');
    
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    console.error('❌ Error ejecutando query:', error);
    throw error;
  }
};

// Función para obtener una conexión del pool
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Interceptar queries para logging
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  // Interceptar release para logging
  client.release = () => {
    console.log('🔌 Conexión liberada del pool');
    client.lastQuery = null;
    return release.apply(client);
  };
  
  return client;
};

// Función para cerrar el pool (útil para tests)
const closePool = async () => {
  await pool.end();
};

module.exports = {
  db: pool,
  query,
  getClient,
  closePool
};
