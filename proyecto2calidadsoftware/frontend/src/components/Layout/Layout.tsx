import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Package, 
  Shield, 
  LogOut, 
  User,
  Bell,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Header from './Header';
import Sidebar from './Sidebar';
import InactivityWarning from '../InactivityWarning';
import { useInactivity } from '../../hooks/useInactivity';
import { INACTIVITY_CONFIG } from '../../config/inactivity';


const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Hook de inactividad
  useInactivity({
    timeout: INACTIVITY_CONFIG.HOOK_TIMEOUT,
    onTimeout: () => {
      setShowInactivityWarning(true);
    }
  });

  const handleExtendSession = () => {
    setShowInactivityWarning(false);
    // El hook se reiniciará automáticamente
  };

  const handleInactivityLogout = async () => {
    setShowInactivityWarning(false);
    await handleLogout();
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, permission: 'view_reports' },
    { name: 'Usuarios', href: '/users', icon: Users, permission: 'view_reports' },
    { name: 'Productos', href: '/products', icon: Package, permission: 'view_reports' },
    { name: 'Roles', href: '/roles', icon: Shield, permission: 'view_reports' },
  ].filter(item => {
    // Filtrar según el rol del usuario
    if (item.name === 'Roles' && user?.roleName === 'Registrador') {
      return false; // Registrador no puede ver Roles
    }
    return user?.permissions.includes(item.permission);
  });

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar navigation={navigation} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar navigation={navigation} onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          user={user} 
          onLogout={handleLogout}
          onExtendSession={handleExtendSession}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Advertencia de inactividad */}
      <InactivityWarning
        isVisible={showInactivityWarning}
        timeLeft={INACTIVITY_CONFIG.WARNING_TIME / 1000}
        onExtend={handleExtendSession}
        onLogout={handleInactivityLogout}
      />
    </div>
  );
};

export default Layout;
