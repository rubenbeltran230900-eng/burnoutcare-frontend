import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, RefreshCw, X, Save, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usuariosService } from '../services/api';

const GestionUsuarios = ({ usuario }) => {
  const { t } = useTranslation();
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
        setError(response.error || t('users_err_load'));
      }
    } catch (err) {
      setError(t('msg_connection_error'));
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
      setError(t('users_err_required'));
      return;
    }

    if (!modoEdicion && !usuarioEditando.password) {
      setError(t('users_err_password_required'));
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
        response = await usuariosService.crear({
          ...usuarioEditando,
          empresa_id: usuario.empresa_id
        });
      }

      if (response.success) {
        cerrarModal();
        cargarUsuarios();
      } else {
        setError(response.error || t('users_err_save'));
      }
    } catch (err) {
      setError(t('msg_connection_error'));
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm(t('users_delete_confirm'))) {
      return;
    }

    try {
      const response = await usuariosService.eliminar(id);
      if (response.success) {
        cargarUsuarios();
      } else {
        setError(response.error || t('users_err_delete'));
      }
    } catch (err) {
      setError(t('msg_connection_error'));
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
          <p className="text-gray-600">{t('users_loading')}</p>
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
            {t('users_title')}
          </h1>
          <p className="text-gray-600">{t('users_subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarUsuarios}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            {t('users_refresh')}
          </button>
          <button
            onClick={abrirModalNuevo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {t('users_new')}
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
            placeholder={t('users_search_placeholder')}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users_name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users_email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users_role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users_area')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('users_position')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('users_status')}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('users_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {t('msg_no_users')}
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
                        {usr.activo ? t('users_active') : t('users_inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirModalEditar(usr)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={t('edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarUsuario(usr.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title={t('delete')}
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
                {modoEdicion ? t('users_edit') : t('users_new')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_name')} *</label>
                <input
                  type="text"
                  value={usuarioEditando.nombre}
                  onChange={(e) => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('users_full_name_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_email')} *</label>
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
                  {t('users_password')} {modoEdicion ? t('users_password_keep') : '*'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_role')} *</label>
                <select
                  value={usuarioEditando.rol}
                  onChange={(e) => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="evaluado">{t('role_evaluated')}</option>
                  <option value="coordinador">{t('role_coordinator')}</option>
                  <option value="profesional">{t('role_professional')}</option>
                  <option value="administrador">{t('role_admin')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_area')}</label>
                  <input
                    type="text"
                    value={usuarioEditando.area || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('users_placeholder_area')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_position')}</label>
                  <input
                    type="text"
                    value={usuarioEditando.puesto || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, puesto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('users_placeholder_position')}
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
                  <label htmlFor="activo" className="text-sm text-gray-700">{t('users_active_label')}</label>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={cerrarModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {t('cancel')}
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
                {guardando ? t('users_saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
