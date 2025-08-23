// Utilidades para almacenamiento seguro de datos sensibles

// Clave de encriptación (en producción debería venir de variables de entorno)
const ENCRYPTION_KEY = 'your-secure-key-here';

// Función simple de encriptación (en producción usar crypto-js o similar)
const encrypt = (data: string): string => {
  try {
    // Encriptación básica para desarrollo
    // En producción usar: crypto-js.AES.encrypt(data, key).toString()
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Error encrypting data:', error);
    return data;
  }
};

// Función simple de desencriptación
const decrypt = (encryptedData: string): string => {
  try {
    // Desencriptación básica para desarrollo
    // En producción usar: crypto-js.AES.decrypt(data, key).toString(crypto-js.enc.Utf8)
    return decodeURIComponent(atob(encryptedData));
  } catch (error) {
    console.error('Error decrypting data:', error);
    return encryptedData;
  }
};

// Almacenamiento seguro en localStorage
export const secureStorage = {
  // Guardar datos de forma segura
  setItem: (key: string, value: any): void => {
    try {
      const encryptedValue = encrypt(JSON.stringify(value));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error saving to secure storage:', error);
      // Fallback a almacenamiento normal si falla la encriptación
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  // Obtener datos de forma segura
  getItem: (key: string): any => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      const decryptedValue = decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      // Fallback a almacenamiento normal
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  },

  // Remover datos
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  // Limpiar todo el almacenamiento
  clear: (): void => {
    localStorage.clear();
  }
};

// Almacenamiento de sesión (se borra al cerrar el navegador)
export const secureSessionStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const encryptedValue = encrypt(JSON.stringify(value));
      sessionStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error saving to secure session storage:', error);
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  },

  getItem: (key: string): any => {
    try {
      const encryptedValue = sessionStorage.getItem(key);
      if (!encryptedValue) return null;
      
      const decryptedValue = decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error reading from secure session storage:', error);
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  },

  removeItem: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  clear: (): void => {
    sessionStorage.clear();
  }
};

// Función para limpiar datos sensibles al logout
export const clearSensitiveData = (): void => {
  const sensitiveKeys = [
    'token',
    'user',
    'auth-storage',
    'user-permissions',
    'session-data'
  ];
  
  sensitiveKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};
