-- Crear tabla de sesiones para express-session en el schema ProductManager
-- Ejecutar este script en PostgreSQL

-- Asegurarse de estar en el schema correcto
SET search_path TO "ProductManager";

-- Crear tabla de sesiones (para express-session)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Crear índice en sid para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_sessions_sid ON sessions(sid);

-- Comentario
COMMENT ON TABLE sessions IS 'Tabla de sesiones para express-session';
