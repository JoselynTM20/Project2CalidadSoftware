import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, User, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.log('Error completo:', error); // Para debugging
      
      let message = 'Error al iniciar sesión';
      
             // Manejar específicamente errores de Axios
       if (error.response) {
         // Error con respuesta del servidor
         if (error.response.status === 429) {
           // Rate limiting - el mensaje viene directamente en error.response.data
           message = error.response.data || 'Error de rate limiting';
         } else if (error.response.data?.message) {
           message = error.response.data.message;
         } else if (error.response.data) {
           // Si no hay .message, usar directamente error.response.data
           message = error.response.data;
         } else {
           message = `Error ${error.response.status}: ${error.response.statusText}`;
         }
       } else if (error.request) {
        // Error de red (sin respuesta del servidor)
        message = 'Error de conexión. Verifique su conexión a internet.';
      } else if (error.message) {
        // Error general
        message = error.message;
      }
      
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistema de Gestión de Productos
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para acceder al sistema
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('username', {
                      required: 'El usuario es requerido',
                      minLength: {
                        value: 3,
                        message: 'El usuario debe tener al menos 3 caracteres',
                      },
                    })}
                    type="text"
                    id="username"
                    className={`input pl-10 ${errors.username ? 'input-error' : ''}`}
                    placeholder="Ingresa tu usuario"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-danger-600">{errors.username.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres',
                      },
                    })}
                    type="password"
                    id="password"
                    className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Sistema de Gestión de Productos con Medidas de Seguridad</p>
          <p className="mt-1">Proyecto de Calidad de Software</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
