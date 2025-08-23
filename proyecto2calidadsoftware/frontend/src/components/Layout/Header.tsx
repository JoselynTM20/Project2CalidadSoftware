import React, { useState } from 'react';
import { Menu, Bell, User, Settings, LogOut, Clock } from 'lucide-react';
import type { User as UserType } from '../../types/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
  onMenuClick: () => void;
  user: UserType | null;
  onLogout: () => void;
  onExtendSession?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user, onLogout, onExtendSession }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const formatLastLogin = (lastLogin: string | undefined) => {
    if (!lastLogin) return 'Nunca';
    try {
      return format(new Date(lastLogin), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and title */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="hidden lg:block ml-4">
              <h1 className="text-lg font-semibold text-gray-900">
                Sistema de Gestión de Productos
              </h1>
            </div>
          </div>

                     {/* Right side - User menu and notifications */}
           <div className="flex items-center space-x-4">
             {/* Extend Session Button */}
             {onExtendSession && (
               <button
                 onClick={onExtendSession}
                 className="p-2 rounded-md text-blue-400 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                 title="Extender sesión"
               >
                 <Clock className="h-5 w-5" />
               </button>
             )}
             
             {/* Notifications */}
             <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
               <Bell className="h-5 w-5" />
             </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.roleName}</p>
                </div>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500">{user?.roleName}</p>
                    {user?.lastLogin && (
                      <p className="text-xs text-gray-400 mt-1">
                        Último login: {formatLastLogin(user.lastLogin)}
                      </p>
                    )}
                                         {user?.permissions && (
                       <div className="mt-2">
                         <p className="text-xs font-medium text-gray-500 mb-1">Permisos:</p>
                         <div className="flex flex-wrap gap-1">
                           {user.permissions.map((permission, index) => (
                             <span
                               key={index}
                               className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                             >
                               {permission.replace(/_/g, ' ')}
                             </span>
                           ))}
                         </div>
                         {/* Debug: Mostrar permisos exactos */}
                         <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                           <p className="font-medium text-gray-700">Debug - Permisos exactos:</p>
                           <code className="text-gray-600">{JSON.stringify(user.permissions, null, 2)}</code>
                         </div>
                       </div>
                     )}
                  </div>
                  
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="mr-3 h-4 w-4" />
                      Perfil
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings className="mr-3 h-4 w-4" />
                      Configuración
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
