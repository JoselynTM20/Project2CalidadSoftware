import React, { useState, useEffect } from 'react';
import { rolesApi } from '../../services/api';
import { Plus, Edit, Trash2, X, Save, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import RolePermissions from './RolePermissions';

interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  permissions: any[];
}

const Roles: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Funciones de verificación de permisos basadas en permisos reales
  const canCreateRoles = () => currentUser?.permissions?.includes('create') || currentUser?.permissions?.includes('create_roles') || false;
  const canEditRoles = () => currentUser?.permissions?.includes('edit') || currentUser?.permissions?.includes('edit_roles') || false;
  const canDeleteRoles = () => currentUser?.permissions?.includes('delete') || currentUser?.permissions?.includes('delete_roles') || false;
  const canManagePermissions = () => currentUser?.permissions?.includes('edit_roles') || currentUser?.permissions?.includes('edit') || false;
  const canViewRoles = () => currentUser?.permissions?.includes('view') || currentUser?.permissions?.includes('view_roles') || currentUser?.permissions?.includes('view_reports') || false;

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await rolesApi.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await rolesApi.createRole(formData);
      setShowForm(false);
      setFormData({ name: '', description: '' });
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingRole) return;
    try {
      await rolesApi.updateRole(editingRole.id, formData);
      setEditingRole(null);
      setFormData({ name: '', description: '' });
      fetchRoles();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      try {
        await rolesApi.deleteRole(id);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const openEditForm = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRole(null);
    setFormData({ name: '', description: '' });
  };

  const openPermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissions(true);
  };

  const closePermissions = () => {
    setShowPermissions(false);
    setSelectedRole(null);
  };

  const showNotification = (type: 'success' | 'warning' | 'error', message: string) => {
    setNotification({ type, message });
    // Notificaciones de permisos se mantienen más tiempo
    const timeout = type === 'warning' ? 15000 : 8000;
    setTimeout(() => setNotification(null), timeout);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p>Cargando roles...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles</h1>
        {canCreateRoles() && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Rol
          </button>
        )}
      </div>

      {/* Formulario de creación/edición */}
      {(showForm || editingRole) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
            </h3>
            <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={editingRole ? handleEdit : handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingRole ? 'Actualizar' : 'Crear'}
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
      
      {/* Tabla de roles */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {role.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{role.description}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      {new Date(role.created_at).toLocaleDateString('es-ES')}
                    </p>
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission: any) => (
                          <span
                            key={permission.id}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {permission.name.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            +{role.permissions.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {canManagePermissions() && (
                      <button
                        onClick={() => openPermissions(role)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Gestionar Permisos"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    )}
                    {canEditRoles() && (
                      <button
                        onClick={() => openEditForm(role)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar Rol"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {canDeleteRoles() && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar Rol"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {!canEditRoles() && !canDeleteRoles() && !canManagePermissions() && (
                      <span className="text-gray-400 text-xs">Solo lectura</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Gestión de Permisos */}
      {showPermissions && selectedRole && (
        <RolePermissions
          role={selectedRole}
          onClose={closePermissions}
          onUpdate={() => {
            fetchRoles();
            showNotification('warning', 'Permisos actualizados. Los usuarios afectados deben cerrar sesión y volver a iniciar para ver los cambios.');
          }}
        />
      )}

      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">{notification.message}</p>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            {notification.type === 'warning' && notification.message.includes('permisos') && (
              <div className="text-sm opacity-90">
                <p className="mb-2">💡 <strong>Consejo:</strong> Si eres uno de los usuarios afectados:</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors"
                >
                  🔄 Cerrar Sesión Ahora
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
