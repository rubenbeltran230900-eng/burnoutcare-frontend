import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, RefreshCw, X, Save, Eye, EyeOff } from 'lucide-react';
import { usuariosService } from '../services/api';

const GestionUsuarios = ({ usuario }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'evaluado',
    area: '',
    puesto: '',
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await usuariosService.obtenerTodos();
      if (response.success) {
        setUsuarios(response.data);
      } else {
        setError(response.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setUsuarioEditando({
      nombre: '',
      email: '',
      password: '',
      rol: 'evaluado',
      area: '',
      puesto: '',
      activo: true
    });
    setModoEdicion(false);
    setMostrarModal(true);
    setMostrarPassword(false);
  };

  const abrirModalEditar = (usr) => {
    setUsuarioEditando({
      ...usr,
      password: '' // No mostrar contraseña actual
    });
    setModoEdicion(true);
    setMostrarModal(true);
    setMostrarPassword(false);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setUsuarioEditando({
      nombre: '',
      email: '',
      password: '',
      rol: 'evaluado',
      area: '',
      puesto: '',
      activo: true
    });
    setError('');
  };

  const guardarUsuario = async () => {
    if (!usuarioEditando.nombre || !usuarioEditando.email) {
      setError('Nombre y email son requeridos');
      return;
    }

    if (!modoEdicion && !usuarioEditando.password) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      let response;
      
      if (modoEdicion) {
        // Preparar datos para actualización
        const datosActualizar = {
          nombre: usuarioEditando.nombre,
          email: usuarioEditando.email,
          rol: usuarioEditando.rol,
          area: usuarioEditando.area,
          puesto: usuarioEditando.puesto,
          activo: usuarioEditando.activo
        };
        
        // Solo incluir password si se proporcionó uno nuevo
        if (usuarioEditando.password) {
          datosActualizar.password = usuarioEditando.password;
        }
        
        response = await usuariosService.actualizar(usuarioEditando.id, datosActualizar);
      } else {
        response = await usuariosService.crear(usuarioEditando);
      }

      if (response.success) {
        cerrarModal();
        cargarUsuarios();
      } else {
        setError(response.error || 'Error al guardar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
      return;
    }

    try {
      const response = await usuariosService.eliminar(id);
      if (response.success) {
        cargarUsuarios();
      } else {
        setError(response.error || 'Error al eliminar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    }
  };

  const getColorRol = (rol) => {
    switch (rol) {
      case 'administrador': return 'bg-purple-100 text-purple-700';
      case 'profesional': return 'bg-blue-100 text-blue-700';
      case 'coordinador': return 'bg-green-100 text-green-700';
      case 'evaluado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const usuariosFiltrados = usuarios.filter(usr =>
    usr.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    usr.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    usr.area?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600">Administración de usuarios del sistema BurnoutCare</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarUsuarios}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={abrirModalNuevo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o área..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puesto</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No hay usuarios que mostrar
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usr) => (
                  <tr key={usr.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{usr.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usr.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getColorRol(usr.rol)}`}>
                        {usr.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usr.area || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usr.puesto || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${usr.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {usr.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirModalEditar(usr)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarUsuario(usr.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                          disabled={usr.id === usuario.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4">
        {['administrador', 'profesional', 'coordinador', 'evaluado'].map((rol) => (
          <div key={rol} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getColorRol(rol)}`}>
                {rol}
              </span>
              <span className="text-2xl font-bold text-gray-800">
                {usuarios.filter(u => u.rol === rol).length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de usuario */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={usuarioEditando.nombre}
                  onChange={(e) => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={usuarioEditando.email}
                  onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {modoEdicion ? '(dejar vacío para mantener actual)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={usuarioEditando.password}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  value={usuarioEditando.rol}
                  onChange={(e) => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="evaluado">Evaluado</option>
                  <option value="coordinador">Coordinador</option>
                  <option value="profesional">Profesional</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                  <input
                    type="text"
                    value={usuarioEditando.area || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Recursos Humanos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                  <input
                    type="text"
                    value={usuarioEditando.puesto || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, puesto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Analista"
                  />
                </div>
              </div>

              {modoEdicion && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={usuarioEditando.activo}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, activo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="activo" className="text-sm text-gray-700">Usuario activo</label>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={cerrarModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={guardarUsuario}
                disabled={guardando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {guardando ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;