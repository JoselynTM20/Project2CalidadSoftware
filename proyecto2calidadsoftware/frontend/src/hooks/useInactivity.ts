import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { USER_ACTIVITY_EVENTS } from '../config/inactivity';

interface UseInactivityOptions {
  timeout: number; // en milisegundos
  onTimeout: () => void;
}

export const useInactivity = ({ timeout, onTimeout }: UseInactivityOptions) => {
  const timeoutRef = useRef<number>();
  const { logout } = useAuthStore();

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      console.log('🕐 Usuario inactivo por más de', timeout / 1000, 'segundos');
      logout();
      onTimeout();
    }, timeout);
  };

  useEffect(() => {
    // Eventos que indican actividad del usuario
    const events = USER_ACTIVITY_EVENTS;

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Iniciar el timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [timeout, onTimeout, logout]);

  return { resetTimer };
};
