import React, { useState, useEffect } from 'react';
import { rolesApi } from '../../services/api';
import { Shield, Plus, X, Save, Check, AlertCircle } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RolePermissionsProps {
  role: Role;
  onClose: () => void;
  onUpdate: () => void;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ role, onClose, onUpdate }) => {
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailablePermissions();
  
    setSelectedPermissions(role.permissions.map(p => p.id));
  }, [role]);

  const fetchAvailablePermissions = async () => {
    try {
      setLoading(true);
     
      const permissions = await rolesApi.getAvailablePermissions();
      setAvailablePermissions(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await rolesApi.updateRolePermissions(role.id, selectedPermissions);
      
      // No mostrar ningún mensaje de alerta
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating role permissions:', error);
      alert('❌ Error al actualizar los permisos del rol');
    } finally {
      setSaving(false);
    }
  };

  const getPermissionCategory = (permissionName: string) => {
    if (permissionName.includes('user')) return 'Usuarios';
    if (permissionName.includes('product')) return 'Productos';
    if (permissionName.includes('role')) return 'Roles';
    if (permissionName.includes('report')) return 'Reportes';
    return 'General';
  };



  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-center">Cargando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gestionar Permisos del Rol: {role.name}
              </h2>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Permisos Disponibles
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Marca o desmarca los permisos que este rol debe tener. Los cambios se aplicarán inmediatamente.
            </p>
          </div>

          {/* Permisos organizados por categoría */}
          <div className="space-y-6">
            {['Usuarios', 'Productos', 'Roles', 'Reportes', 'General'].map(category => {
              const categoryPermissions = availablePermissions.filter(p => 
                getPermissionCategory(p.name) === category
              );
              
              if (categoryPermissions.length === 0) return null;

              return (
                <div key={category} className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">{category}</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {categoryPermissions.map(permission => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {permission.name.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">
                            {selectedPermissions.includes(permission.id) ? 'Activo' : 'Inactivo'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen de permisos seleccionados */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Resumen de Permisos</h4>
            </div>
            <p className="text-sm text-blue-800">
              Este rol tendrá <strong>{selectedPermissions.length}</strong> permisos activos de un total de{' '}
              <strong>{availablePermissions.length}</strong> permisos disponibles.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Los cambios se aplicarán inmediatamente al rol</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Permisos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
