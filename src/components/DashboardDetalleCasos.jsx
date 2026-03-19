import React, { useState, useEffect } from 'react';
import { User, Calendar, Briefcase, Building, TrendingUp, TrendingDown, Minus, RefreshCw, ArrowLeft } from 'lucide-react';
import { evaluacionesService } from '../services/api';

const DashboardDetalleCasos = ({ usuario, onCambiarModulo }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
        if (response.data.length > 0) {
          setEvaluacionSeleccionada(response.data[0]);
        }
      }
    } catch (err) {
      setError('Error al cargar evaluaciones');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const getColorRiesgo = (nivel) => {
    switch (nivel) {
      case 'Alto': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', fill: '#EF4444' };
      case 'Medio': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', fill: '#F59E0B' };
      case 'Bajo': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', fill: '#10B981' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', fill: '#6B7280' };
    }
  };

  const determinarNivel = (puntaje) => {
    if (puntaje < 50) return 'Bajo';
    if (puntaje < 75) return 'Medio';
    return 'Alto';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener historial de evaluaciones del mismo usuario
  const obtenerHistorial = () => {
    if (!evaluacionSeleccionada) return [];
    return evaluaciones
      .filter(e => e.usuario_id === evaluacionSeleccionada.usuario_id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  // Calcular tendencia comparando con evaluación anterior
  const calcularTendencia = (dimension) => {
    const historial = obtenerHistorial();
    if (historial.length < 2) return null;
    
    const actual = historial[0][`puntaje_${dimension}`];
    const anterior = historial[1][`puntaje_${dimension}`];
    
    if (actual < anterior) return 'mejora';
    if (actual > anterior) return 'empeora';
    return 'igual';
  };

  const TendenciaIcon = ({ tendencia }) => {
    if (tendencia === 'mejora') return <TrendingDown className="w-4 h-4 text-green-500" />;
    if (tendencia === 'empeora') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (tendencia === 'igual') return <Minus className="w-4 h-4 text-gray-500" />;
    return null;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando casos...</p>
        </div>
      </div>
    );
  }

  if (evaluaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No hay evaluaciones registradas</h2>
        <p className="text-gray-500 mt-2">Las evaluaciones aparecerán aquí cuando se realicen</p>
        <button
          onClick={() => onCambiarModulo('evaluacion')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Realizar Evaluación
        </button>
      </div>
    );
  }

  const historial = obtenerHistorial();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detalle de Casos</h1>
          <p className="text-gray-600">Análisis individual de evaluaciones CBI</p>
        </div>
        <button
          onClick={cargarEvaluaciones}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de casos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-4">Casos Evaluados</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {evaluaciones.map((ev) => {
                const color = getColorRiesgo(ev.nivel_riesgo);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setEvaluacionSeleccionada(ev)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      evaluacionSeleccionada?.id === ev.id
                        ? 'bg-blue-100 border-2 border-blue-400'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{ev.usuario_nombre}</p>
                        <p className="text-xs text-gray-500">{ev.area || 'Sin área'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
                        {ev.nivel_riesgo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detalle del caso */}
        <div className="lg:col-span-3">
          {evaluacionSeleccionada && (
            <div className="space-y-6">
              {/* Información del colaborador */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{evaluacionSeleccionada.usuario_nombre}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {evaluacionSeleccionada.area || 'Sin área'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {evaluacionSeleccionada.puesto || 'Sin puesto'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${getColorRiesgo(evaluacionSeleccionada.nivel_riesgo).bg}`}>
                    <p className="text-xs text-gray-600">Nivel de Riesgo</p>
                    <p className={`text-xl font-bold ${getColorRiesgo(evaluacionSeleccionada.nivel_riesgo).text}`}>
                      {evaluacionSeleccionada.nivel_riesgo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resultados CBI */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Resultados Copenhagen Burnout Inventory (CBI)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Burnout Personal */}
                  <div className={`p-4 rounded-lg border-2 ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bp)).border} ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bp)).bg}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-700">Burnout Personal</h4>
                      <TendenciaIcon tendencia={calcularTendencia('bp')} />
                    </div>
                    <p className={`text-3xl font-bold ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bp)).text}`}>
                      {evaluacionSeleccionada.puntaje_bp}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Nivel: {evaluacionSeleccionada.nivel_bp}</p>
                    <div className="mt-3 bg-white bg-opacity-50 rounded p-2">
                      <p className="text-xs text-gray-600">
                        Mide el agotamiento físico y psicológico general experimentado por la persona.
                      </p>
                    </div>
                  </div>

                  {/* Burnout Laboral */}
                  <div className={`p-4 rounded-lg border-2 ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bl)).border} ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bl)).bg}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-700">Burnout Laboral</h4>
                      <TendenciaIcon tendencia={calcularTendencia('bl')} />
                    </div>
                    <p className={`text-3xl font-bold ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bl)).text}`}>
                      {evaluacionSeleccionada.puntaje_bl}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Nivel: {evaluacionSeleccionada.nivel_bl}</p>
                    <div className="mt-3 bg-white bg-opacity-50 rounded p-2">
                      <p className="text-xs text-gray-600">
                        Mide el agotamiento percibido en relación directa con el trabajo.
                      </p>
                    </div>
                  </div>

                  {/* Burnout por Cliente */}
                  <div className={`p-4 rounded-lg border-2 ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bc)).border} ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bc)).bg}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-700">Burnout por Cliente</h4>
                      <TendenciaIcon tendencia={calcularTendencia('bc')} />
                    </div>
                    <p className={`text-3xl font-bold ${getColorRiesgo(determinarNivel(evaluacionSeleccionada.puntaje_bc)).text}`}>
                      {evaluacionSeleccionada.puntaje_bc}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Nivel: {evaluacionSeleccionada.nivel_bc}</p>
                    <div className="mt-3 bg-white bg-opacity-50 rounded p-2">
                      <p className="text-xs text-gray-600">
                        Mide el agotamiento relacionado con el trabajo con clientes o usuarios.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barra visual de puntajes */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Visualización de puntajes (0-100)</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-32">Personal (BP)</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all ${evaluacionSeleccionada.puntaje_bp >= 75 ? 'bg-red-500' : evaluacionSeleccionada.puntaje_bp >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${evaluacionSeleccionada.puntaje_bp}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{evaluacionSeleccionada.puntaje_bp}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-32">Laboral (BL)</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all ${evaluacionSeleccionada.puntaje_bl >= 75 ? 'bg-red-500' : evaluacionSeleccionada.puntaje_bl >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${evaluacionSeleccionada.puntaje_bl}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{evaluacionSeleccionada.puntaje_bl}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-32">Cliente (BC)</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all ${evaluacionSeleccionada.puntaje_bc >= 75 ? 'bg-red-500' : evaluacionSeleccionada.puntaje_bc >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${evaluacionSeleccionada.puntaje_bc}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{evaluacionSeleccionada.puntaje_bc}</span>
                    </div>
                  </div>

                  {/* Leyenda */}
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded" /> 0-49: Bajo
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded" /> 50-74: Medio
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded" /> 75-100: Alto
                    </span>
                  </div>
                </div>
              </div>

              {/* Historial de evaluaciones */}
              {historial.length > 1 && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Historial de Evaluaciones</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Fecha</th>
                          <th className="text-center py-2 px-3">BP</th>
                          <th className="text-center py-2 px-3">BL</th>
                          <th className="text-center py-2 px-3">BC</th>
                          <th className="text-center py-2 px-3">Riesgo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((ev, idx) => (
                          <tr key={ev.id} className={`border-b ${idx === 0 ? 'bg-blue-50' : ''}`}>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {formatearFecha(ev.fecha)}
                                {idx === 0 && <span className="text-xs bg-blue-200 text-blue-800 px-2 rounded">Actual</span>}
                              </div>
                            </td>
                            <td className="text-center py-2 px-3">{ev.puntaje_bp}</td>
                            <td className="text-center py-2 px-3">{ev.puntaje_bl}</td>
                            <td className="text-center py-2 px-3">{ev.puntaje_bc}</td>
                            <td className="text-center py-2 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${getColorRiesgo(ev.nivel_riesgo).bg} ${getColorRiesgo(ev.nivel_riesgo).text}`}>
                                {ev.nivel_riesgo}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-4">
                <button
                  onClick={() => onCambiarModulo('recomendaciones')}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Ver Recomendaciones IA
                </button>
                <button
                  onClick={() => onCambiarModulo('seguimiento')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Seguimiento Clínico
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDetalleCasos;