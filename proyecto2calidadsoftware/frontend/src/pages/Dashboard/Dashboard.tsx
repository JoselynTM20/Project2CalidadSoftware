import React, { useState, useEffect } from 'react';
import { usersApi, productsApi, rolesApi } from '../../services/api.js';
import { 
  Users, 
  Package, 
  Shield, 
  TrendingUp, 
  Search,
  BarChart3,
  FileText,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalRoles: number;
  lowStockProducts: number;
  recentUsers: any[];
  recentProducts: any[];
  productStats: {
    totalQuantity: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas en paralelo
      const [users, products, productStats] = await Promise.all([
        usersApi.getUsers(),
        productsApi.getProducts(),
        productsApi.getProductStats()
      ]);

      // Calcular estadísticas
      const lowStockProducts = products.filter((p: any) => p.quantity < 10).length;
      
      // Usuarios recientes (últimos 5)
      const recentUsers = users.slice(0, 5);
      
      // Productos recientes (últimos 5)
      const recentProducts = products.slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalRoles: 4, // Roles fijos: SuperAdmin, Admin, Auditor, Registrador
        lowStockProducts,
        recentUsers,
        recentProducts,
        productStats: productStats.stats || {
          totalQuantity: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const results = await productsApi.searchProducts(searchQuery);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-center mt-2">Cargando dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-center text-red-600">Error al cargar el dashboard</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRoles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda de productos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Búsqueda de Productos
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por código, nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Resultados de búsqueda:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {searchResults.map((product: any) => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">Código: {product.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price}</p>
                    <p className="text-sm text-gray-600">Stock: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas de productos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Estadísticas de Productos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {stats.productStats.totalQuantity.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total en Stock</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              ${stats.productStats.averagePrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Precio Promedio</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              ${stats.productStats.minPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Precio Mínimo</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              ${stats.productStats.maxPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Precio Máximo</p>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usuarios recientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuarios Recientes
          </h2>
          <div className="space-y-3">
            {stats.recentUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-600">{user.role_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos recientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Productos Recientes
          </h2>
          <div className="space-y-3">
            {stats.recentProducts.map((product: any) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">Código: {product.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${product.price}</p>
                  <p className="text-sm text-gray-600">Stock: {product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reportes rápidos */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Reportes Rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <Activity className="h-6 w-6 text-blue-600 mb-2" />
            <p className="font-medium text-blue-900">Reporte de Usuarios</p>
            <p className="text-sm text-blue-700">Ver actividad y estadísticas de usuarios</p>
          </button>
          
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <Package className="h-6 w-6 text-green-600 mb-2" />
            <p className="font-medium text-green-900">Reporte de Inventario</p>
            <p className="text-sm text-green-700">Análisis de stock y productos</p>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <Shield className="h-6 w-6 text-purple-600 mb-2" />
            <p className="font-medium text-purple-900">Reporte de Permisos</p>
            <p className="text-sm text-purple-700">Gestión de roles y accesos</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
