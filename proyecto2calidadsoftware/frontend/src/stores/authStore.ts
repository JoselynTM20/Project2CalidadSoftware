import { create } from 'zustand';
import type { AuthState, User, LoginResponse } from '../types/auth';
import { authApi } from '../services/api';
import { secureStorage, secureSessionStorage, clearSensitiveData } from '../utils/secureStorage';


interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const response = await authApi.login({ username, password });
      
      // Store token securely in sessionStorage (se borra al cerrar navegador)
      secureSessionStorage.setItem('token', response.token);
      
      // Store minimal user info securely (solo datos no sensibles)
      const safeUserData = {
        id: response.user.id,
        username: response.user.username,
        roleName: response.user.roleName,
        permissions: response.user.permissions
      };
      
      secureSessionStorage.setItem('user', safeUserData);
      
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call logout API
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all sensitive data
      clearSensitiveData();
      
      // Clear state
      get().clearAuth();
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Get token from secure storage
      const token = secureSessionStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      // Verify token with backend
      const user = await authApi.getCurrentUser();
      
      // Update secure storage with fresh data
      const safeUserData = {
        id: user.id,
        username: user.username,
        roleName: user.roleName,
        permissions: user.permissions
      };
      
      secureSessionStorage.setItem('user', safeUserData);
      
      set({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      get().clearAuth();
    }
  },

  clearAuth: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  },
}));
