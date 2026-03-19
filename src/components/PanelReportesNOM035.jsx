import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, Calendar, Building, Users, RefreshCw } from 'lucide-react';
import { evaluacionesService } from '../services/api';

const PanelReportesNOM035 = ({ usuario }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [reporteGenerado, setReporteGenerado] = useState(null);
  const [tipoReporte, setTipoReporte] = useState('general');

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
      }
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Calcular estadísticas para el reporte
  const calcularEstadisticas = () => {
    if (evaluaciones.length === 0) return null;

    const stats = {
      total: evaluaciones.length,
      porRiesgo: { Alto: 0, Medio: 0, Bajo: 0 },
      promedios: { bp: 0, bl: 0, bc: 0 },
      porArea: {},
      fechaInicio: null,
      fechaFin: null
    };

    evaluaciones.forEach(ev => {
      // Conteo por riesgo
      stats.porRiesgo[ev.nivel_riesgo]++;
      
      // Suma para promedios
      stats.promedios.bp += ev.puntaje_bp;
      stats.promedios.bl += ev.puntaje_bl;
      stats.promedios.bc += ev.puntaje_bc;
      
      // Por área
      const area = ev.area || 'Sin área';
      if (!stats.porArea[area]) {
        stats.porArea[area] = { total: 0, alto: 0, medio: 0, bajo: 0 };
      }
      stats.porArea[area].total++;
      stats.porArea[area][ev.nivel_riesgo.toLowerCase()]++;
      
      // Fechas
      const fecha = new Date(ev.fecha);
      if (!stats.fechaInicio || fecha < stats.fechaInicio) stats.fechaInicio = fecha;
      if (!stats.fechaFin || fecha > stats.fechaFin) stats.fechaFin = fecha;
    });

    // Calcular promedios
    stats.promedios.bp = Math.round(stats.promedios.bp / stats.total);
    stats.promedios.bl = Math.round(stats.promedios.bl / stats.total);
    stats.promedios.bc = Math.round(stats.promedios.bc / stats.total);

    return stats;
  };

  const generarReporte = () => {
    const stats = calcularEstadisticas();
    if (!stats) return;

    const reporte = {
      tipo: tipoReporte,
      fechaGeneracion: new Date().toISOString(),
      periodo: {
        inicio: stats.fechaInicio,
        fin: stats.fechaFin
      },
      estadisticas: stats,
      generadoPor: usuario.nombre,
      empresa: usuario.empresa_nombre
    };

    setReporteGenerado(reporte);
  };

  const descargarReporte = () => {
    if (!reporteGenerado) return;

    const stats = reporteGenerado.estadisticas;
    
    let contenido = `
================================================================================
                    REPORTE DE EVALUACIÓN DE RIESGO PSICOSOCIAL
                         Copenhagen Burnout Inventory (CBI)
                    En cumplimiento con NOM-035-STPS-2018
================================================================================

INFORMACIÓN GENERAL
-------------------
Empresa: ${reporteGenerado.empresa || 'No especificada'}
Fecha de generación: ${new Date(reporteGenerado.fechaGeneracion).toLocaleString('es-MX')}
Generado por: ${reporteGenerado.generadoPor}
Período de evaluación: ${stats.fechaInicio?.toLocaleDateString('es-MX')} - ${stats.fechaFin?.toLocaleDateString('es-MX')}

================================================================================
RESUMEN EJECUTIVO
================================================================================

Total de evaluaciones realizadas: ${stats.total}

DISTRIBUCIÓN POR NIVEL DE RIESGO:
---------------------------------
- Riesgo Alto:  ${stats.porRiesgo.Alto} colaboradores (${Math.round(stats.porRiesgo.Alto/stats.total*100)}%)
- Riesgo Medio: ${stats.porRiesgo.Medio} colaboradores (${Math.round(stats.porRiesgo.Medio/stats.total*100)}%)
- Riesgo Bajo:  ${stats.porRiesgo.Bajo} colaboradores (${Math.round(stats.porRiesgo.Bajo/stats.total*100)}%)

PROMEDIOS INSTITUCIONALES CBI (Escala 0-100):
---------------------------------------------
- Burnout Personal (BP):     ${stats.promedios.bp} - ${stats.promedios.bp >= 75 ? 'ALTO' : stats.promedios.bp >= 50 ? 'MEDIO' : 'BAJO'}
- Burnout Laboral (BL):      ${stats.promedios.bl} - ${stats.promedios.bl >= 75 ? 'ALTO' : stats.promedios.bl >= 50 ? 'MEDIO' : 'BAJO'}
- Burnout por Cliente (BC):  ${stats.promedios.bc} - ${stats.promedios.bc >= 75 ? 'ALTO' : stats.promedios.bc >= 50 ? 'MEDIO' : 'BAJO'}

================================================================================
ANÁLISIS POR ÁREA
================================================================================
`;

    Object.entries(stats.porArea).forEach(([area, datos]) => {
      contenido += `
${area}
${'-'.repeat(area.length)}
Total evaluados: ${datos.total}
- Alto: ${datos.alto} | Medio: ${datos.medio} | Bajo: ${datos.bajo}
`;
    });

    contenido += `
================================================================================
INTERPRETACIÓN DE RESULTADOS CBI
================================================================================

El Copenhagen Burnout Inventory evalúa tres dimensiones:

1. BURNOUT PERSONAL (BP): Agotamiento físico y psicológico general
2. BURNOUT LABORAL (BL): Agotamiento relacionado directamente con el trabajo
3. BURNOUT POR CLIENTE (BC): Agotamiento derivado del trabajo con personas

Escala de interpretación (0-100):
- 0-49:  Nivel BAJO - Sin indicadores significativos de burnout
- 50-74: Nivel MEDIO - Presencia moderada, requiere monitoreo
- 75-100: Nivel ALTO - Indicadores significativos, requiere intervención

================================================================================
CUMPLIMIENTO NOM-035-STPS-2018
================================================================================

Este reporte forma parte de las acciones de identificación y análisis de
factores de riesgo psicosocial establecidas en la NOM-035-STPS-2018.

Acciones recomendadas según resultados:

${stats.porRiesgo.Alto > 0 ? `
⚠️  CASOS DE RIESGO ALTO (${stats.porRiesgo.Alto}):
    - Derivación inmediata a profesional de salud
    - Revisión de carga de trabajo
    - Seguimiento semanal
` : ''}
${stats.porRiesgo.Medio > 0 ? `
⚡ CASOS DE RIESGO MEDIO (${stats.porRiesgo.Medio}):
    - Monitoreo mensual
    - Implementar medidas preventivas
    - Evaluar factores de riesgo específicos
` : ''}
${stats.porRiesgo.Bajo > 0 ? `
✅ CASOS DE RIESGO BAJO (${stats.porRiesgo.Bajo}):
    - Mantener condiciones actuales
    - Reevaluación trimestral
    - Fomentar prácticas de autocuidado
` : ''}

================================================================================
FIRMAS
================================================================================

Elaboró: ________________________     Fecha: ______________

Revisó:  ________________________     Fecha: ______________

Autorizó: _______________________     Fecha: ______________

================================================================================
                         Documento generado por BurnoutCare
                    Sistema de Detección y Apoyo - CBI
================================================================================
`;

    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_NOM035_CBI_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const stats = calcularEstadisticas();

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
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
            <FileText className="w-8 h-8 text-blue-600" />
            Reportes NOM-035
          </h1>
          <p className="text-gray-600">Generación de reportes de cumplimiento normativo con CBI</p>
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

      {/* Info NOM-035 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Acerca de la NOM-035-STPS-2018</h3>
        <p className="text-blue-700 text-sm">
          Esta norma establece los elementos para identificar, analizar y prevenir los factores de riesgo psicosocial, 
          así como promover un entorno organizacional favorable en los centros de trabajo. El uso del Copenhagen Burnout 
          Inventory (CBI) complementa el cumplimiento de esta normativa al evaluar específicamente el síndrome de burnout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de generación */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Generar Reporte</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de reporte
                </label>
                <select
                  value={tipoReporte}
                  onChange={(e) => setTipoReporte(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Reporte General</option>
                  <option value="ejecutivo">Resumen Ejecutivo</option>
                  <option value="detallado">Reporte Detallado</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Datos disponibles:</p>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{evaluaciones.length} evaluaciones</span>
                </div>
                {stats && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {formatearFecha(stats.fechaInicio)} - {formatearFecha(stats.fechaFin)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={generarReporte}
                disabled={evaluaciones.length === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Generar Reporte
              </button>
            </div>
          </div>

          {/* Checklist de cumplimiento */}
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Checklist NOM-035</h3>
            <div className="space-y-3">
              {[
                { texto: 'Política de prevención documentada', cumple: true },
                { texto: 'Identificación de factores de riesgo', cumple: evaluaciones.length > 0 },
                { texto: 'Evaluación del entorno organizacional', cumple: evaluaciones.length >= 5 },
                { texto: 'Medidas de prevención implementadas', cumple: false },
                { texto: 'Capacitación a trabajadores', cumple: false }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.cumple ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`text-sm ${item.cumple ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.texto}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vista previa del reporte */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Vista Previa del Reporte</h3>
              {reporteGenerado && (
                <button
                  onClick={descargarReporte}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              )}
            </div>

            {!reporteGenerado ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Genera un reporte para ver la vista previa</p>
              </div>
            ) : (
              <div className="border rounded-lg p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
                {/* Encabezado del reporte */}
                <div className="text-center border-b pb-4 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    REPORTE DE EVALUACIÓN DE RIESGO PSICOSOCIAL
                  </h2>
                  <p className="text-gray-600">Copenhagen Burnout Inventory (CBI)</p>
                  <p className="text-sm text-gray-500">En cumplimiento con NOM-035-STPS-2018</p>
                </div>

                {/* Info general */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Información General</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Empresa:</span>
                      <span className="ml-2 font-medium">{reporteGenerado.empresa || 'No especificada'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha:</span>
                      <span className="ml-2 font-medium">{formatearFecha(reporteGenerado.fechaGeneracion)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Generado por:</span>
                      <span className="ml-2 font-medium">{reporteGenerado.generadoPor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total evaluaciones:</span>
                      <span className="ml-2 font-medium">{stats?.total || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Distribución */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Distribución por Nivel de Riesgo</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-red-100 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-700">{stats?.porRiesgo.Alto || 0}</p>
                      <p className="text-sm text-red-600">Riesgo Alto</p>
                      <p className="text-xs text-red-500">
                        {stats ? Math.round(stats.porRiesgo.Alto / stats.total * 100) : 0}%
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-100 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-700">{stats?.porRiesgo.Medio || 0}</p>
                      <p className="text-sm text-yellow-600">Riesgo Medio</p>
                      <p className="text-xs text-yellow-500">
                        {stats ? Math.round(stats.porRiesgo.Medio / stats.total * 100) : 0}%
                      </p>
                    </div>
                    <div className="p-4 bg-green-100 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">{stats?.porRiesgo.Bajo || 0}</p>
                      <p className="text-sm text-green-600">Riesgo Bajo</p>
                      <p className="text-xs text-green-500">
                        {stats ? Math.round(stats.porRiesgo.Bajo / stats.total * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promedios CBI */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Promedios Institucionales CBI</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Burnout Personal (BP)</span>
                        <span className="font-medium">{stats?.promedios.bp || 0}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${(stats?.promedios.bp || 0) >= 75 ? 'bg-red-500' : (stats?.promedios.bp || 0) >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${stats?.promedios.bp || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Burnout Laboral (BL)</span>
                        <span className="font-medium">{stats?.promedios.bl || 0}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${(stats?.promedios.bl || 0) >= 75 ? 'bg-red-500' : (stats?.promedios.bl || 0) >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${stats?.promedios.bl || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Burnout por Cliente (BC)</span>
                        <span className="font-medium">{stats?.promedios.bc || 0}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${(stats?.promedios.bc || 0) >= 75 ? 'bg-red-500' : (stats?.promedios.bc || 0) >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${stats?.promedios.bc || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Escala de referencia */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Escala de Referencia CBI</h4>
                  <div className="flex gap-4 text-sm">
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
      </div>
    </div>
  );
};

export default PanelReportesNOM035;