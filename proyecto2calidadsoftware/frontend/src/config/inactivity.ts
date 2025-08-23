// Configuración de inactividad del usuario
export const INACTIVITY_CONFIG = {
  // Tiempo total de inactividad antes del logout (en milisegundos)
  TOTAL_TIMEOUT: 60000, // 1 minuto
  
  // Tiempo antes del logout para mostrar la advertencia (en milisegundos)
  WARNING_TIME: 30000, // 30 segundos
  
  // Tiempo real del hook (TOTAL_TIMEOUT - WARNING_TIME)
  HOOK_TIMEOUT: 30000, // 30 segundos
} as const;

// Eventos que indican actividad del usuario
export const USER_ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove', 
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'keydown',
  'wheel',
  'focus',
  'blur'
] as const;
