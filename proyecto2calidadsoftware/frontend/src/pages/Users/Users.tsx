import React, { useState, useEffect } from 'react';
import { usersApi, rolesApi } from '../../services/api';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface UserData {
  id: number;
  username: string;
  role_id: number;
  role_name: string;
  last_login: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: 1
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  // Funciones de verificación de permisos basadas en permisos reales
  const canCreateUsers = () => currentUser?.permissions?.includes('create') || currentUser?.permissions?.includes('create_users') || false;
  const canEditUsers = () => currentUser?.permissions?.includes('edit') || currentUser?.permissions?.includes('edit_users') || false;
  const canDeleteUsers = () => currentUser?.permissions?.includes('delete') || currentUser?.permissions?.includes('delete_users') || false;
  const canViewUsers = () => currentUser?.permissions?.includes('view') || currentUser?.permissions?.includes('view_users') || currentUser?.permissions?.includes('view_reports') || false;

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getUsers();
      const usersData = response.map((user: any) => ({
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        role_name: user.role_name,
        last_login: user.last_login
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await rolesApi.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setBackendErrors([]);
      await usersApi.createUser({
        username: formData.username,
        password: formData.password,
        roleId: formData.role_id
      });
      setShowForm(false);
      setFormData({ username: '', password: '', role_id: 1 });
      setErrors({});
      setBackendErrors([]);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg);
        setBackendErrors(errorMessages);
      } else {
        setBackendErrors(['Error al crear el usuario']);
      }
    }
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    if (!validateForm()) return;
    
    try {
      setBackendErrors([]);
      const updateData: any = { username: formData.username, roleId: formData.role_id };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await usersApi.updateUser(editingUser.id, updateData);
      setEditingUser(null);
      setFormData({ username: '', password: '', role_id: 1 });
      setErrors({});
      setBackendErrors([]);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg);
        setBackendErrors(errorMessages);
      } else {
        setBackendErrors(['Error al actualizar el usuario']);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await usersApi.deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const openEditForm = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role_id: user.role_id
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role_id: 1 });
    setErrors({});
    setBackendErrors([]);
  };

  // Validaciones del frontend
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (!/^[a-zA-Z0-9_\s]+$/.test(formData.username)) {
      newErrors.username = 'El nombre de usuario solo puede contener letras, números, espacios y guiones bajos';
    }
    
    // Validar password (solo para creación)
    if (!editingUser && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.trim() && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (formData.password.trim() && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        {canCreateUsers() && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Formulario de creación/edición */}
      {(showForm || editingUser) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Errores del backend */}
          {backendErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <ul className="list-disc list-inside">
                {backendErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  if (errors.username) setErrors({ ...errors, username: '' });
                  if (backendErrors.length > 0) setBackendErrors([]);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                  if (backendErrors.length > 0) setBackendErrors([]);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {!editingUser && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial
                </p>
              )}
            </div>
                          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Selecciona el rol que tendrá este usuario
                </p>
              </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={editingUser ? handleEdit : handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingUser ? 'Actualizar' : 'Crear'}
            </button>
            <button
              onClick={closeForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      {/* Tabla de usuarios */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {canEditUsers() && (
                      <button
                        onClick={() => openEditForm(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar Usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {canDeleteUsers() && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar Usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {!canEditUsers() && !canDeleteUsers() && (
                      <span className="text-gray-400 text-xs">Solo lectura</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
