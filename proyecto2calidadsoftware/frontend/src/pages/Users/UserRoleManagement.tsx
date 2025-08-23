import React, { useState, useEffect } from 'react';
import { usersApi, rolesApi } from '../../services/api';
import { Shield, User, Edit, Save, X } from 'lucide-react';

interface UserWithRole {
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

const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        usersApi.getUsers(),
        rolesApi.getRoles()
      ]);
      // Mapear los datos de la API a la interfaz local
      const mappedUsers = usersData.map((user: any) => ({
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        role_name: user.role_name,
        last_login: user.last_login
      }));
      setUsers(mappedUsers);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: UserWithRole) => {
    setEditingUser(user);
    setSelectedRole(user.role_id);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;

    try {
      await usersApi.updateUser(editingUser.id, {
        roleId: selectedRole
      });
      
      // Actualizar la lista local
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, role_id: selectedRole, role_name: roles.find(r => r.id === selectedRole)?.name || '' }
          : user
      ));
      
      setEditingUser(null);
      setSelectedRole(1);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setSelectedRole(1);
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'registrador':
        return 'bg-orange-100 text-orange-800';
      case 'auditor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-center mt-2">Cargando gestión de roles...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles de Usuarios</h1>
        <p className="text-gray-600 mt-2">
          Asigna y gestiona los roles de los usuarios del sistema
        </p>
      </div>

      {/* Información de roles disponibles */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Roles Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{role.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role.name)}`}>
                  {role.name}
                </span>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de usuarios con gestión de roles */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" />
            Usuarios y sus Roles
          </h2>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser?.id === user.id ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role_name)}`}>
                      {user.role_name}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingUser?.id === user.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveRole}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <Save className="h-4 w-4" />
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditRole(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Cambiar Rol
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Información sobre Roles:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>SuperAdmin:</strong> Acceso completo al sistema, puede gestionar usuarios, roles y permisos</li>
          <li>• <strong>Admin:</strong> Puede gestionar productos y ver reportes, acceso limitado a usuarios</li>
          <li>• <strong>Registrador:</strong> Puede crear, editar y borrar productos, ver lista de usuarios</li>
          <li>• <strong>Auditor:</strong> Solo puede ver reportes y productos, sin permisos de modificación</li>
        </ul>
      </div>
    </div>
  );
};

export default UserRoleManagement;
