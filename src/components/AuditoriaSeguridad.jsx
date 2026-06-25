import React, { useState, useEffect } from 'react';
import { Lock, Search, RefreshCw, Filter, Calendar, User, Activity, Database, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auditoriaService } from '../services/api';

const AuditoriaSeguridad = ({ usuario }) => {
  const { t } = useTranslation();
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('todos');
  const [filtroModulo, setFiltroModulo] = useState('todos');

  useEffect(() => {
    cargarAuditoria();
  }, []);

 const cargarAuditoria = async () => {
  setCargando(true);
  setError('');
  try {
    const response = await auditoriaService.obtenerTodos();
    if (response.success) {
      setRegistros(response.data);
    } else {
      setError(response.error || t('msg_connection_error'));
    }
  } catch (err) {
    setError(t('msg_connection_error'));
    console.error(err);
  } finally {
    setCargando(false);
  }
};

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getColorAccion = (accion) => {
    switch (accion) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'LOGIN': return 'bg-purple-100 text-purple-700';
      case 'LOGOUT': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIconoAccion = (accion) => {
    switch (accion) {
      case 'CREATE': return <Database className="w-4 h-4" />;
      case 'UPDATE': return <Activity className="w-4 h-4" />;
      case 'DELETE': return <Database className="w-4 h-4" />;
      case 'LOGIN': return <User className="w-4 h-4" />;
      case 'LOGOUT': return <User className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Action values (CREATE/UPDATE/DELETE/LOGIN/LOGOUT) are backend data identifiers kept as-is in
  // switch/filter logic; only their display labels are translated via t().
  const traducirAccion = (accion) => {
    const traducciones = {
      'CREATE': t('action_create'),
      'UPDATE': t('action_update'),
      'DELETE': t('action_delete'),
      'LOGIN': t('action_login'),
      'LOGOUT': t('action_logout')
    };
    return traducciones[accion] || accion;
  };

  const traducirModulo = (modulo) => {
    const traducciones = {
      'usuarios': t('module_usuarios'),
      'evaluaciones': t('module_evaluaciones'),
      'empresas': t('module_empresas'),
      'recomendaciones': t('module_recomendaciones'),
      'auth': t('module_auth')
    };
    return traducciones[modulo] || modulo;
  };

  // Obtener valores únicos para filtros
  const accionesUnicas = [...new Set(registros.map(r => r.accion))];
  const modulosUnicos = [...new Set(registros.map(r => r.modulo))];

  // Filtrar registros
  const registrosFiltrados = registros.filter(registro => {
    const cumpleBusqueda = !busqueda ||
      registro.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      registro.modulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      registro.detalles?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleFiltroAccion = filtroAccion === 'todos' || registro.accion === filtroAccion;
    const cumpleFiltroModulo = filtroModulo === 'todos' || registro.modulo === filtroModulo;

    return cumpleBusqueda && cumpleFiltroAccion && cumpleFiltroModulo;
  });

  // Estadísticas
  const estadisticas = {
    total: registros.length,
    creates: registros.filter(r => r.accion === 'CREATE').length,
    updates: registros.filter(r => r.accion === 'UPDATE').length,
    deletes: registros.filter(r => r.accion === 'DELETE').length
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('audit_loading')}</p>
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
            <Lock className="w-8 h-8 text-blue-600" />
            {t('audit_title')}
          </h1>
          <p className="text-gray-600">{t('audit_subtitle')}</p>
        </div>
        <button
          onClick={cargarAuditoria}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          {t('update')}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('audit_total')}</p>
              <p className="text-xl font-bold text-gray-800">{estadisticas.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('audit_creates')}</p>
              <p className="text-xl font-bold text-green-600">{estadisticas.creates}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('audit_updates')}</p>
              <p className="text-xl font-bold text-blue-600">{estadisticas.updates}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Database className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('audit_deletes')}</p>
              <p className="text-xl font-bold text-red-600">{estadisticas.deletes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('audit_search_placeholder')}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">{t('audit_filter_all_actions')}</option>
              {accionesUnicas.map(accion => (
                <option key={accion} value={accion}>{traducirAccion(accion)}</option>
              ))}
            </select>
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">{t('audit_filter_all_modules')}</option>
              {modulosUnicos.map(modulo => (
                <option key={modulo} value={modulo}>{traducirModulo(modulo)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('audit_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('audit_user')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('audit_action')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('audit_module')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('audit_details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {t('msg_no_data')}
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((registro) => (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatearFecha(registro.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {registro.usuario_nombre || t('audit_system')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColorAccion(registro.accion)}`}>
                        {getIconoAccion(registro.accion)}
                        {traducirAccion(registro.accion)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{traducirModulo(registro.modulo)}</span>
                    </td>
                    <td className="px-6 py-4">
  <span className="text-sm text-gray-500 truncate block max-w-xs">
    {registro.detalles ? (
      typeof registro.detalles === 'string' ? registro.detalles.substring(0, 50) : '-'
    ) : '-'}
  </span>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info de seguridad */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t('audit_security_info_title')}
        </h3>
        <p className="text-blue-700 text-sm">
          {t('audit_security_info_text')}
        </p>
      </div>
    </div>
  );
};

export default AuditoriaSeguridad;
