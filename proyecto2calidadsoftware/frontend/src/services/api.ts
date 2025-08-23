import axios, { type AxiosResponse } from 'axios';
import type { LoginCredentials, LoginResponse, User } from '../types/auth';
import { secureSessionStorage } from '../utils/secureStorage';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = secureSessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      secureSessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  register: async (userData: { username: string; password: string; roleId: number }): Promise<any> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.users;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  },

  createUser: async (userData: { username: string; password: string; roleId: number }): Promise<any> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<{ username: string; password: string; roleId: number }>): Promise<any> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getUserPermissions: async (id: number): Promise<any[]> => {
    const response = await api.get(`/users/${id}/permissions`);
    return response.data.permissions;
  },
};

// Products API
export const productsApi = {
  getProducts: async (): Promise<any[]> => {
    const response = await api.get('/products');
    return response.data.products;
  },

  getProduct: async (id: number): Promise<any> => {
    const response = await api.get(`/products/${id}`);
    return response.data.product;
  },

  createProduct: async (productData: any): Promise<any> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: number, productData: any): Promise<any> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  searchProducts: async (query: string): Promise<any[]> => {
    const response = await api.get(`/products/search/${encodeURIComponent(query)}`);
    return response.data.products;
  },

  getProductStats: async (): Promise<any> => {
    const response = await api.get('/products/stats/summary');
    return response.data.stats;
  },
};

// Roles API
export const rolesApi = {
  getRoles: async (): Promise<any[]> => {
    const response = await api.get('/roles');
    return response.data.roles;
  },

  getRole: async (id: number): Promise<any> => {
    const response = await api.get(`/roles/${id}`);
    return response.data.role;
  },

  createRole: async (roleData: { name: string; description?: string }): Promise<any> => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  updateRole: async (id: number, roleData: Partial<{ name: string; description?: string }>): Promise<any> => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  assignPermissions: async (roleId: number, permissionIds: number[]): Promise<any> => {
    const response = await api.post(`/roles/${roleId}/permissions`, { permissionIds });
    return response.data;
  },

  getRolePermissions: async (roleId: number): Promise<any[]> => {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data.permissions;
  },

  getAvailablePermissions: async (): Promise<any[]> => {
    const response = await api.get('/roles/available/permissions');
    return response.data.permissions;
  },

  updateRolePermissions: async (roleId: number, permissionIds: number[]): Promise<any> => {
    const response = await api.put(`/roles/${roleId}/permissions`, { permissionIds });
    return response.data;
  },
};

export default api;
