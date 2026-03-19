import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, AlertTriangle, RefreshCw, Building } from 'lucide-react';
import { evaluacionesService } from '../services/api';

const PanelInstitucionalIndicadores = ({ usuario }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    try {
      const [evalResponse, statsResponse] = await Promise.all([
        evaluacionesService.obtenerTodas(),
        evaluacionesService.obtenerEstadisticas()
      ]);

      if (evalResponse.success) {
        setEvaluaciones(evalResponse.data);
      }
      if (statsResponse.success) {
        setEstadisticas(statsResponse.data);
      }
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Calcular estadísticas por área
  const calcularEstadisticasPorArea = () => {
    const porArea = {};
    evaluaciones.forEach(ev => {
      const area = ev.area || 'Sin área';
      if (!porArea[area]) {
        porArea[area] = { total: 0, alto: 0, medio: 0, bajo: 0, sumaBP: 0, sumaBL: 0, sumaBC: 0 };
      }
      porArea[area].total++;
      porArea[area][ev.nivel_riesgo.toLowerCase()]++;
      porArea[area].sumaBP += ev.puntaje_bp;
      porArea[area].sumaBL += ev.puntaje_bl;
      porArea[area].sumaBC += ev.puntaje_bc;
    });

    return Object.entries(porArea).map(([area, datos]) => ({
      area,
      ...datos,
      promedioBP: Math.round(datos.sumaBP / datos.total),
      promedioBL: Math.round(datos.sumaBL / datos.total),
      promedioBC: Math.round(datos.sumaBC / datos.total)
    }));
  };

  const getColorRiesgo = (nivel) => {
    switch (nivel) {
      case 'Alto': return 'bg-red-500';
      case 'Medio': return 'bg-yellow-500';
      case 'Bajo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getColorPuntaje = (puntaje) => {
    if (puntaje >= 75) return 'text-red-600';
    if (puntaje >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando indicadores...</p>
        </div>
      </div>
    );
  }

  const estadisticasArea = calcularEstadisticasPorArea();
  const distribucion = estadisticas?.distribucion || [];
  const promedios = estadisticas?.promedios || { promedio_bp: 0, promedio_bl: 0, promedio_bc: 0 };

  // Calcular porcentajes para el gráfico de distribución
  const totalEvaluaciones = estadisticas?.total || 0;
  const getConteo = (nivel) => {
    const item = distribucion.find(d => d.nivel_riesgo === nivel);
    return item ? parseInt(item.cantidad) : 0;
  };
  const getPorcentaje = (nivel) => {
    if (totalEvaluaciones === 0) return 0;
    return Math.round((getConteo(nivel) / totalEvaluaciones) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Panel de Indicadores Institucionales
          </h1>
          <p className="text-gray-600">Métricas y estadísticas del Copenhagen Burnout Inventory (CBI)</p>
        </div>
        <button
          onClick={cargarDatos}
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

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Evaluaciones</p>
              <p className="text-2xl font-bold text-gray-800">{totalEvaluaciones}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Riesgo Alto</p>
              <p className="text-2xl font-bold text-red-600">{getConteo('Alto')}</p>
              <p className="text-xs text-gray-500">{getPorcentaje('Alto')}% del total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Riesgo Medio</p>
              <p className="text-2xl font-bold text-yellow-600">{getConteo('Medio')}</p>
              <p className="text-xs text-gray-500">{getPorcentaje('Medio')}% del total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Riesgo Bajo</p>
              <p className="text-2xl font-bold text-green-600">{getConteo('Bajo')}</p>
              <p className="text-xs text-gray-500">{getPorcentaje('Bajo')}% del total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por nivel de riesgo */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Distribución por Nivel de Riesgo</h3>
          
          {totalEvaluaciones === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          ) : (
            <div className="space-y-4">
              {/* Gráfico de barras horizontal */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Alto</span>
                    <span className="font-medium text-red-600">{getConteo('Alto')} ({getPorcentaje('Alto')}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-red-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(getPorcentaje('Alto'), 5)}%` }}
                    >
                      {getPorcentaje('Alto') > 10 && <span className="text-white text-xs font-medium">{getPorcentaje('Alto')}%</span>}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Medio</span>
                    <span className="font-medium text-yellow-600">{getConteo('Medio')} ({getPorcentaje('Medio')}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-yellow-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(getPorcentaje('Medio'), 5)}%` }}
                    >
                      {getPorcentaje('Medio') > 10 && <span className="text-white text-xs font-medium">{getPorcentaje('Medio')}%</span>}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Bajo</span>
                    <span className="font-medium text-green-600">{getConteo('Bajo')} ({getPorcentaje('Bajo')}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-green-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(getPorcentaje('Bajo'), 5)}%` }}
                    >
                      {getPorcentaje('Bajo') > 10 && <span className="text-white text-xs font-medium">{getPorcentaje('Bajo')}%</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico circular simple */}
              <div className="flex justify-center mt-6">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {/* Fondo */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                    
                    {/* Segmentos */}
                    {totalEvaluaciones > 0 && (
                      <>
                        <circle
                          cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20"
                          strokeDasharray={`${getPorcentaje('Bajo') * 2.51} 251`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="20"
                          strokeDasharray={`${getPorcentaje('Medio') * 2.51} 251`}
                          strokeDashoffset={`${-getPorcentaje('Bajo') * 2.51}`}
                        />
                        <circle
                          cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="20"
                          strokeDasharray={`${getPorcentaje('Alto') * 2.51} 251`}
                          strokeDashoffset={`${-(getPorcentaje('Bajo') + getPorcentaje('Medio')) * 2.51}`}
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{totalEvaluaciones}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Promedios CBI */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Promedios Institucionales CBI</h3>
          
          {totalEvaluaciones === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          ) : (
            <div className="space-y-6">
              {/* Burnout Personal */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Burnout Personal (BP)</span>
                  <span className={`text-2xl font-bold ${getColorPuntaje(promedios.promedio_bp || 0)}`}>
                    {promedios.promedio_bp || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${promedios.promedio_bp >= 75 ? 'bg-red-500' : promedios.promedio_bp >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${promedios.promedio_bp || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Agotamiento físico y psicológico general</p>
              </div>

              {/* Burnout Laboral */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Burnout Laboral (BL)</span>
                  <span className={`text-2xl font-bold ${getColorPuntaje(promedios.promedio_bl || 0)}`}>
                    {promedios.promedio_bl || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${promedios.promedio_bl >= 75 ? 'bg-red-500' : promedios.promedio_bl >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${promedios.promedio_bl || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Agotamiento relacionado con el trabajo</p>
              </div>

              {/* Burnout por Cliente */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Burnout por Cliente (BC)</span>
                  <span className={`text-2xl font-bold ${getColorPuntaje(promedios.promedio_bc || 0)}`}>
                    {promedios.promedio_bc || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${promedios.promedio_bc >= 75 ? 'bg-red-500' : promedios.promedio_bc >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${promedios.promedio_bc || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Agotamiento en relación con clientes/usuarios</p>
              </div>

              {/* Escala de referencia */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">Escala de referencia CBI (0-100):</p>
                <div className="flex gap-4 text-xs">
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
          )}
        </div>
      </div>

      {/* Estadísticas por área */}
      {estadisticasArea.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Indicadores por Área
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Área</th>
                  <th className="text-center py-3 px-4">Evaluaciones</th>
                  <th className="text-center py-3 px-4">Prom. BP</th>
                  <th className="text-center py-3 px-4">Prom. BL</th>
                  <th className="text-center py-3 px-4">Prom. BC</th>
                  <th className="text-center py-3 px-4">Alto</th>
                  <th className="text-center py-3 px-4">Medio</th>
                  <th className="text-center py-3 px-4">Bajo</th>
                </tr>
              </thead>
              <tbody>
                {estadisticasArea.map((area, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{area.area}</td>
                    <td className="text-center py-3 px-4">{area.total}</td>
                    <td className={`text-center py-3 px-4 font-medium ${getColorPuntaje(area.promedioBP)}`}>
                      {area.promedioBP}
                    </td>
                    <td className={`text-center py-3 px-4 font-medium ${getColorPuntaje(area.promedioBL)}`}>
                      {area.promedioBL}
                    </td>
                    <td className={`text-center py-3 px-4 font-medium ${getColorPuntaje(area.promedioBC)}`}>
                      {area.promedioBC}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {area.alto}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        {area.medio}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {area.bajo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelInstitucionalIndicadores;