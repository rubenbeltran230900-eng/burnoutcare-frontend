import React, { useState, useEffect } from 'react';
import { Shield, Users, BarChart3, ClipboardList, Activity, FileText, Settings, LogOut, ChevronRight, Menu, X, Bell, Lock, User, Eye, EyeOff, Brain, Globe } from 'lucide-react';
import { authService } from './services/api';
import { useTranslation } from 'react-i18next';

import ModuloEvaluacionCBI from './components/ModuloEvaluacionMBI';
import DashboardProfesionalAlertas from './components/DashboardProfesionalAlertas';
import DashboardDetalleCasos from './components/DashboardDetalleCasos';
import DashboardSeguimientoClinico from './components/DashboardSeguimientoClinico';
import PanelInstitucionalIndicadores from './components/PanelInstitucionalIndicadores';
import PanelReportesNOM035 from './components/PanelReportesNOM035';
import GestionUsuarios from './components/GestionUsuarios';
import GestionRolesPermisos from './components/GestionRolesPermisos';
import AuditoriaSeguridad from './components/AuditoriaSeguridad';
import MotorRecomendacionesIA from './components/MotorRecomendacionesIA';

function App() {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [cargando, setCargando] = useState(false);
const { t, i18n } = useTranslation();

const cambiarIdioma = (idioma) => {
  i18n.changeLanguage(idioma);
  localStorage.setItem('language', idioma);
};

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const usuario = authService.getUsuarioActual();
    if (usuario && authService.estaAutenticado()) {
      setUsuarioAutenticado(usuario);
      setModuloActivo('evaluacion');
    }
  }, []);

  // Definición de módulos por rol
  const modulosPorRol = {
    administrador: [
      { id: 'evaluacion', nombre: 'Evaluación CBI', icono: ClipboardList, descripcion: 'Realizar evaluación de burnout' },
      { id: 'alertas', nombre: 'Dashboard Alertas', icono: Bell, descripcion: 'Monitoreo de casos críticos' },
      { id: 'detalle', nombre: 'Detalle de Casos', icono: Users, descripcion: 'Análisis individual de casos' },
      { id: 'seguimiento', nombre: 'Seguimiento Clínico', icono: Activity, descripcion: 'Seguimiento de intervenciones' },
      { id: 'indicadores', nombre: 'Indicadores', icono: BarChart3, descripcion: 'Panel de indicadores institucionales' },
      { id: 'reportes', nombre: 'Reportes NOM-035', icono: FileText, descripcion: 'Generación de reportes normativos' },
      { id: 'usuarios', nombre: 'Gestión Usuarios', icono: Users, descripcion: 'Administración de usuarios' },
      { id: 'roles', nombre: 'Roles y Permisos', icono: Shield, descripcion: 'Configuración de accesos' },
      { id: 'auditoria', nombre: 'Auditoría', icono: Lock, descripcion: 'Registro de actividades' },
      { id: 'recomendaciones', nombre: 'Recomendaciones IA', icono: Brain, descripcion: 'Motor de recomendaciones inteligentes' }
    ],
    profesional: [
      { id: 'evaluacion', nombre: 'Evaluación CBI', icono: ClipboardList, descripcion: 'Realizar evaluación de burnout' },
      { id: 'alertas', nombre: 'Dashboard Alertas', icono: Bell, descripcion: 'Monitoreo de casos críticos' },
      { id: 'detalle', nombre: 'Detalle de Casos', icono: Users, descripcion: 'Análisis individual de casos' },
      { id: 'seguimiento', nombre: 'Seguimiento Clínico', icono: Activity, descripcion: 'Seguimiento de intervenciones' },
      { id: 'recomendaciones', nombre: 'Recomendaciones IA', icono: Brain, descripcion: 'Motor de recomendaciones inteligentes' }
    ],
    coordinador: [
      { id: 'evaluacion', nombre: 'Evaluación CBI', icono: ClipboardList, descripcion: 'Realizar evaluación de burnout' },
      { id: 'indicadores', nombre: 'Indicadores', icono: BarChart3, descripcion: 'Panel de indicadores institucionales' },
      { id: 'reportes', nombre: 'Reportes NOM-035', icono: FileText, descripcion: 'Generación de reportes normativos' }
    ],
    evaluado: [
      { id: 'evaluacion', nombre: 'Evaluación CBI', icono: ClipboardList, descripcion: 'Realizar evaluación de burnout' },
    ]
  };

  // Función de login con API
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    setCargando(true);

    try {
      const response = await authService.login(credenciales.email, credenciales.password);
      
      if (response.success) {
        setUsuarioAutenticado(response.data.usuario);
        setModuloActivo('evaluacion');
        setMostrarLogin(false);
        setCredenciales({ email: '', password: '' });
      } else {
        setErrorLogin(response.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setErrorLogin('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  // Función de logout
  const handleLogout = () => {
    authService.logout();
    setUsuarioAutenticado(null);
    setModuloActivo(null);
    setMostrarLogin(false);
  };

  // Renderizar módulo activo
  const renderizarModulo = () => {
    const props = { 
      usuario: usuarioAutenticado,
      onCambiarModulo: setModuloActivo
    };

    switch (moduloActivo) {
     case 'evaluacion':
        return <ModuloEvaluacionCBI {...props} />;
      case 'alertas':
        return <DashboardProfesionalAlertas {...props} />;
      case 'detalle':
        return <DashboardDetalleCasos {...props} />;
      case 'seguimiento':
        return <DashboardSeguimientoClinico {...props} />;
      case 'indicadores':
        return <PanelInstitucionalIndicadores {...props} />;
      case 'reportes':
        return <PanelReportesNOM035 {...props} />;
      case 'usuarios':
        return <GestionUsuarios {...props} />;
      case 'roles':
        return <GestionRolesPermisos {...props} />;
      case 'auditoria':
        return <AuditoriaSeguridad {...props} />;
      case 'recomendaciones':
        return <MotorRecomendacionesIA {...props} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">Selecciona un módulo</h2>
              <p className="text-gray-500">Usa el menú lateral para navegar</p>
            </div>
          </div>
        );
    }
  };

  // Obtener módulos del usuario actual
  const obtenerModulosUsuario = () => {
    if (!usuarioAutenticado) return [];
    return modulosPorRol[usuarioAutenticado.rol] || [];
  };

  // Pantalla de selección de rol / login
  if (!usuarioAutenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">BurnoutCare</h1>
            <p className="text-blue-200">Sistema de Detección y Apoyo</p>
          </div>

          {!mostrarLogin ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
              <button
                onClick={() => setMostrarLogin(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Acceder al Sistema
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <button
                onClick={() => {
                  setMostrarLogin(false);
                  setErrorLogin('');
                }}
                className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← Volver
              </button>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Ingresa tus credenciales
              </h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={credenciales.email}
                      onChange={(e) => setCredenciales({ ...credenciales, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={credenciales.password}
                      onChange={(e) => setCredenciales({ ...credenciales, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {errorLogin && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errorLogin}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">
                  <strong>Usuario de prueba:</strong><br />
                  admin@demo.com / 123456
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pantalla principal con módulos
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${menuAbierto ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            {menuAbierto && (
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="font-bold">BurnoutCare</h1>
                  <p className="text-xs text-blue-300">Sistema de Apoyo</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Usuario actual */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            {menuAbierto && (
              <div>
                <p className="font-medium text-sm">{usuarioAutenticado.nombre}</p>
                <p className="text-xs text-blue-300 capitalize">{usuarioAutenticado.rol}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {obtenerModulosUsuario().map((modulo) => {
            const Icono = modulo.icono;
            const activo = moduloActivo === modulo.id;
            return (
              <button
                key={modulo.id}
                onClick={() => setModuloActivo(modulo.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activo 
                    ? 'bg-white text-blue-900 shadow-lg' 
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
                title={!menuAbierto ? modulo.nombre : ''}
              >
                <Icono className="w-5 h-5 flex-shrink-0" />
                {menuAbierto && (
                  <>
                    <span className="flex-1 text-left text-sm">{modulo.nombre}</span>
                    {activo && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Selector de idioma y Logout */}
<div className="p-4 border-t border-blue-700 space-y-2">
  <button
    onClick={() => cambiarIdioma(i18n.language === 'es' ? 'en' : 'es')}
    className="w-full flex items-center gap-3 p-3 text-blue-100 hover:bg-blue-700 rounded-lg transition-colors"
  >
    <Globe className="w-5 h-5" />
    {menuAbierto && <span>{i18n.language === 'es' ? 'English' : 'Español'}</span>}
  </button>
  <button
    onClick={handleLogout}
    className="w-full flex items-center gap-3 p-3 text-blue-100 hover:bg-red-600 rounded-lg transition-colors"
  >
    <LogOut className="w-5 h-5" />
    {menuAbierto && <span>{t('logout')}</span>}
  </button>
</div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderizarModulo()}
        </div>
      </main>
    </div>
  );
}

export default App;