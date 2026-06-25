import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Users, TrendingUp, Filter, Search, RefreshCw } from 'lucide-react';
import { evaluacionesService } from '../services/api';

const DashboardProfesionalAlertas = ({ usuario, onCambiarModulo }) => {
  const { t } = useTranslation();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroRiesgo, setFiltroRiesgo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Cargar evaluaciones al montar
  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const cargarEvaluaciones = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await evaluacionesService.obtenerTodas();
      if (response.success) {
        setEvaluaciones(response.data);
      } else {
        setError(t('alerts_err_load'));
      }
    } catch (err) {
      setError(t('msg_connection_error'));
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar evaluaciones
  const evaluacionesFiltradas = evaluaciones.filter(ev => {
    const cumpleFiltroRiesgo = filtroRiesgo === 'todos' || ev.nivel_riesgo === filtroRiesgo;
    const cumpleBusqueda = !busqueda ||
      ev.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ev.area?.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltroRiesgo && cumpleBusqueda;
  });

  // Contar por nivel de riesgo
  const contarPorRiesgo = (nivel) => evaluaciones.filter(e => e.nivel_riesgo === nivel).length;

  // Color según nivel de riesgo
  const getColorRiesgo = (nivel) => {
    switch (nivel) {
      case 'Alto': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      case 'Medio': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
      case 'Bajo': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('alerts_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('dashboard_title')}</h1>
          <p className="text-gray-600">{t('dashboard_subtitle')}</p>
        </div>
        <button
          onClick={cargarEvaluaciones}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('total_evaluations')}</p>
              <p className="text-2xl font-bold text-gray-800">{evaluaciones.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => setFiltroRiesgo(filtroRiesgo === 'Alto' ? 'todos' : 'Alto')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('risk_high')}</p>
              <p className="text-2xl font-bold text-red-600">{contarPorRiesgo('Alto')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => setFiltroRiesgo(filtroRiesgo === 'Medio' ? 'todos' : 'Medio')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('risk_medium')}</p>
              <p className="text-2xl font-bold text-yellow-600">{contarPorRiesgo('Medio')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => setFiltroRiesgo(filtroRiesgo === 'Bajo' ? 'todos' : 'Bajo')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('risk_low')}</p>
              <p className="text-2xl font-bold text-green-600">{contarPorRiesgo('Bajo')}</p>
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
              placeholder={t('alerts_search_placeholder')}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filtroRiesgo}
              onChange={(e) => setFiltroRiesgo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">{t('alerts_filter_all')}</option>
              <option value="Alto">{t('risk_high')}</option>
              <option value="Medio">{t('risk_medium')}</option>
              <option value="Bajo">{t('risk_low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de evaluaciones */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts_col_collaborator')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts_col_area')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts_col_date')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BP
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BL
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BC
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts_col_risk')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('alerts_col_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {t('alerts_no_results')}
                  </td>
                </tr>
              ) : (
                evaluacionesFiltradas.map((evaluacion) => {
                  const colorRiesgo = getColorRiesgo(evaluacion.nivel_riesgo);
                  return (
                    <tr key={evaluacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{evaluacion.usuario_nombre}</div>
                        <div className="text-sm text-gray-500">{evaluacion.puesto || t('alerts_no_position')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {evaluacion.area || t('alerts_no_area')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatearFecha(evaluacion.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getColorRiesgo(evaluacion.nivel_bp).bg} ${getColorRiesgo(evaluacion.nivel_bp).text}`}>
                          {evaluacion.puntaje_bp}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getColorRiesgo(evaluacion.nivel_bl).bg} ${getColorRiesgo(evaluacion.nivel_bl).text}`}>
                          {evaluacion.puntaje_bl}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getColorRiesgo(evaluacion.nivel_bc).bg} ${getColorRiesgo(evaluacion.nivel_bc).text}`}>
                          {evaluacion.puntaje_bc}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${colorRiesgo.bg} ${colorRiesgo.text}`}>
                          {evaluacion.nivel_riesgo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => onCambiarModulo('detalle')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t('alerts_view_detail')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('alerts_legend_title')}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">BP:</span> {t('dim_personal')}
          </div>
          <div>
            <span className="font-medium">BL:</span> {t('dim_work')}
          </div>
          <div>
            <span className="font-medium">BC:</span> {t('dim_client')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfesionalAlertas;
