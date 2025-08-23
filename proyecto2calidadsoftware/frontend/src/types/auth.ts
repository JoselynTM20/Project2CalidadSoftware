export interface User {
  id: number;
  username: string;
  roleId: number;
  roleName: string;
  permissions: string[];
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  userCount: number;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  roleId: number;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  roleId?: number;
}
