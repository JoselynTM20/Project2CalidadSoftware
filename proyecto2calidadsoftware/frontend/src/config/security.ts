// Configuración de seguridad de la aplicación

export const SECURITY_CONFIG = {
  // Configuración de cookies
  COOKIES: {
    // Cookies seguras (HTTPS only en producción)
    SECURE: process.env.NODE_ENV === 'production',
    
    // Cookies httpOnly (no accesibles desde JavaScript)
    HTTP_ONLY: true,
    
    // Cookies sameSite para prevenir CSRF
    SAME_SITE: 'strict' as const,
    
    // Tiempo de expiración de cookies (en segundos)
    MAX_AGE: 3600, // 1 hora
    
    // Dominio de las cookies
    DOMAIN: process.env.NODE_ENV === 'production' ? '.tudominio.com' : undefined,
    
    // Path de las cookies
    PATH: '/',
  },

  // Configuración de JWT
  JWT: {
    // Tiempo de expiración del token (en segundos)
    EXPIRES_IN: 3600, // 1 hora
    
    // Tiempo de expiración del refresh token (en segundos)
    REFRESH_EXPIRES_IN: 86400, // 24 horas
    
    // Algoritmo de firma
    ALGORITHM: 'HS256',
  },

  // Configuración de almacenamiento
  STORAGE: {
    // Usar sessionStorage en lugar de localStorage
    USE_SESSION_STORAGE: true,
    
    // Encriptar datos sensibles
    ENCRYPT_SENSITIVE_DATA: true,
    
    // Clave de encriptación (en producción usar variable de entorno)
    ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY || 'dev-secure-key',
    
    // Datos que NO se deben almacenar
    SENSITIVE_FIELDS: [
      'password',
      'password_hash',
      'credit_card',
      'ssn',
      'personal_id',
      'address',
      'phone',
      'email',
      'date_of_birth'
    ],
    
    // Datos seguros para almacenar
    SAFE_FIELDS: [
      'id',
      'username',
      'roleName',
      'permissions',
      'lastLogin'
    ]
  },

  // Configuración de headers de seguridad
  HEADERS: {
    // Headers de seguridad recomendados
    SECURITY_HEADERS: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  },

  // Configuración de rate limiting
  RATE_LIMITING: {
    // Máximo de intentos de login por IP
    MAX_LOGIN_ATTEMPTS: 5,
    
    // Ventana de tiempo para rate limiting (en minutos)
    WINDOW_MS: 15,
    
    // Bloquear IP después de exceder límite (en minutos)
    BLOCK_DURATION: 30
  }
} as const;

// Función para validar si un campo es seguro para almacenar
export const isFieldSafe = (fieldName: string): boolean => {
  return SECURITY_CONFIG.STORAGE.SAFE_FIELDS.includes(fieldName);
};

// Función para validar si un campo es sensible
export const isFieldSensitive = (fieldName: string): boolean => {
  return SECURITY_CONFIG.STORAGE.SENSITIVE_FIELDS.includes(fieldName);
};

// Función para limpiar datos sensibles de un objeto
export const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized: any = {};
  
  Object.keys(data).forEach(key => {
    if (isFieldSafe(key)) {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};
