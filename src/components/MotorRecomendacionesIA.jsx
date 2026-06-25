import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, RefreshCw, AlertTriangle, CheckCircle, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { evaluacionesService, recomendacionesService } from '../services/api';

const MotorRecomendacionesIA = ({ usuario }) => {
  const { t } = useTranslation();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [recomendacion, setRecomendacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});

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
      setError(t('msg_connection_error'));
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const generarRecomendacion = async (evaluacionId) => {
    setGenerando(true);
    setError('');
    setRecomendacion(null);

    try {
      const response = await recomendacionesService.generar(evaluacionId);
      if (response.success) {
        setRecomendacion(response.data);
        setSeccionesAbiertas({
          analisis: true,
          dimensiones: true,
          inmediatas: true,
          mediano: false,
          autocuidado: false,
          seguimiento: false
        });
      } else {
        setError(response.error || t('msg_connection_error'));
      }
    } catch (err) {
      setError(t('msg_connection_error'));
      console.error(err);
    } finally {
      setGenerando(false);
    }
  };

  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // nivel_riesgo values ('Alto', 'Medio', 'Bajo') come from backend — kept as-is for color mapping
  const getColorRiesgo = (nivel) => {
    switch (nivel) {
      case 'Alto': return 'text-red-600 bg-red-100';
      case 'Medio': return 'text-yellow-600 bg-yellow-100';
      case 'Bajo': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // nivel_urgencia values ('ALTA', 'MEDIA', 'BAJA') come from backend — kept as-is for color mapping
  const getColorUrgencia = (urgencia) => {
    switch (urgencia) {
      case 'ALTA': return 'text-red-600 bg-red-100 border-red-300';
      case 'MEDIA': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'BAJA': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('loading')}</p>
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
            <Brain className="w-8 h-8 text-purple-600" />
            {t('rec_title')}
          </h1>
          <p className="text-gray-600">{t('rec_subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de evaluaciones */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-4">{t('rec_available_evals')}</h2>

            {evaluaciones.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('rec_no_evals')}</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {evaluaciones.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setEvaluacionSeleccionada(ev)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      evaluacionSeleccionada?.id === ev.id
                        ? 'bg-purple-100 border-2 border-purple-400'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{ev.usuario_nombre}</p>
                        {/* ev.area is user data kept as-is */}
                        <p className="text-sm text-gray-500">{ev.area || t('rec_no_area')}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatearFecha(ev.fecha)}</p>
                      </div>
                      {/* ev.nivel_riesgo is a backend data value kept as-is */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorRiesgo(ev.nivel_riesgo)}`}>
                        {ev.nivel_riesgo}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                      {/* BP, BL, BC are CBI dimension abbreviations (data identifiers) kept as-is */}
                      <div className="text-center p-1 bg-white rounded">
                        <span className="text-gray-500">BP:</span> {ev.puntaje_bp}
                      </div>
                      <div className="text-center p-1 bg-white rounded">
                        <span className="text-gray-500">BL:</span> {ev.puntaje_bl}
                      </div>
                      <div className="text-center p-1 bg-white rounded">
                        <span className="text-gray-500">BC:</span> {ev.puntaje_bc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de recomendación */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            {!evaluacionSeleccionada ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">{t('rec_select_eval')}</h3>
                <p className="text-gray-500">{t('rec_select_eval_hint')}</p>
              </div>
            ) : (
              <>
                {/* Info de evaluación seleccionada */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {evaluacionSeleccionada.usuario_nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {evaluacionSeleccionada.area} • {evaluacionSeleccionada.puesto}
                    </p>
                  </div>
                  <button
                    onClick={() => generarRecomendacion(evaluacionSeleccionada.id)}
                    disabled={generando}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {generando ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t('rec_generating')}
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        {t('rec_generate')}
                      </>
                    )}
                  </button>
                </div>

                {/* Recomendación generada */}
                {recomendacion && recomendacion.contenido && (
                  <div className="space-y-4">
                    {/* Tipo de recomendación */}
                    {/* recomendacion.tipo values ('IA', other) are backend data identifiers kept as-is */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded ${recomendacion.tipo === 'IA' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {recomendacion.tipo === 'IA' ? `🤖 ${t('rec_ai')}` : `📋 ${t('rec_rules')}`}
                      </span>
                      <span className="text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatearFecha(recomendacion.created_at)}
                      </span>
                    </div>

                    {/* Urgencia */}
                    {/* nivel_urgencia is a backend data value kept as-is for color mapping */}
                    <div className={`p-4 rounded-lg border-2 ${getColorUrgencia(recomendacion.contenido.nivel_urgencia)}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">{t('rec_urgency_label')} {recomendacion.contenido.nivel_urgencia}</span>
                      </div>
                    </div>

                    {/* Análisis General */}
                    <div className="border rounded-lg">
                      <button
                        onClick={() => toggleSeccion('analisis')}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="font-semibold text-gray-800">{t('rec_analysis')}</span>
                        {seccionesAbiertas.analisis ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {seccionesAbiertas.analisis && (
                        <div className="p-4 pt-0">
                          <p className="text-gray-700">{recomendacion.contenido.analisis_general}</p>
                        </div>
                      )}
                    </div>

                    {/* Dimensiones */}
                    <div className="border rounded-lg">
                      <button
                        onClick={() => toggleSeccion('dimensiones')}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="font-semibold text-gray-800">{t('rec_dimensions')}</span>
                        {seccionesAbiertas.dimensiones ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {seccionesAbiertas.dimensiones && recomendacion.contenido.dimensiones && (
                        <div className="p-4 pt-0 space-y-4">
                          {Object.entries(recomendacion.contenido.dimensiones).map(([key, dim]) => (
                            <div key={key} className="p-3 bg-gray-50 rounded-lg">
                              {/* dimension key is a backend data identifier kept as-is */}
                              <h4 className="font-medium text-gray-800 capitalize mb-2">
                                {key.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">{dim.interpretacion}</p>
                              {dim.senales_alerta && (
                                <div className="flex flex-wrap gap-2">
                                  {dim.senales_alerta.map((senal, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                      ⚠️ {senal}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recomendaciones Inmediatas */}
                    <div className="border rounded-lg">
                      <button
                        onClick={() => toggleSeccion('inmediatas')}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="font-semibold text-gray-800">🚨 {t('rec_immediate')}</span>
                        {seccionesAbiertas.inmediatas ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {seccionesAbiertas.inmediatas && recomendacion.contenido.recomendaciones_inmediatas && (
                        <div className="p-4 pt-0">
                          <div className="space-y-3">
                            {recomendacion.contenido.recomendaciones_inmediatas.map((rec, idx) => (
                              <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                                {/* rec.accion, rec.responsable, rec.plazo are backend data kept as-is */}
                                <p className="font-medium text-gray-800">{rec.accion}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                  <span>👤 {rec.responsable}</span>
                                  <span>⏱️ {rec.plazo}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recomendaciones Mediano Plazo */}
                    <div className="border rounded-lg">
                      <button
                        onClick={() => toggleSeccion('mediano')}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="font-semibold text-gray-800">📅 {t('rec_medium')}</span>
                        {seccionesAbiertas.mediano ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {seccionesAbiertas.mediano && recomendacion.contenido.recomendaciones_mediano_plazo && (
                        <div className="p-4 pt-0">
                          <div className="space-y-3">
                            {recomendacion.contenido.recomendaciones_mediano_plazo.map((rec, idx) => (
                              <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="font-medium text-gray-800">{rec.accion}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                  <span>👤 {rec.responsable}</span>
                                  <span>⏱️ {rec.plazo}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Técnicas de Autocuidado */}
                    <div className="border rounded-lg">
                      <button
                        onClick={() => toggleSeccion('autocuidado')}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="font-semibold text-gray-800">💚 {t('rec_selfcare')}</span>
                        {seccionesAbiertas.autocuidado ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {seccionesAbiertas.autocuidado && recomendacion.contenido.tecnicas_autocuidado && (
                        <div className="p-4 pt-0">
                          <ul className="space-y-2">
                            {recomendacion.contenido.tecnicas_autocuidado.map((tecnica, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                {/* tecnica is backend AI-generated content kept as-is */}
                                <span className="text-gray-700">{tecnica}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Seguimiento */}
                    <div className="border rounded-lg">
                      <button
                        onClick={() => toggleSeccion('seguimiento')}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="font-semibold text-gray-800">📊 {t('rec_followup')}</span>
                        {seccionesAbiertas.seguimiento ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {seccionesAbiertas.seguimiento && recomendacion.contenido.seguimiento && (
                        <div className="p-4 pt-0 space-y-4">
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">{t('rec_next_eval')}</p>
                            {/* proxima_evaluacion is backend data kept as-is */}
                            <p className="font-medium text-purple-700">{recomendacion.contenido.seguimiento.proxima_evaluacion}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-green-700 mb-2">✅ {t('rec_improvement')}</p>
                              <ul className="text-sm space-y-1">
                                {recomendacion.contenido.seguimiento.indicadores_mejora?.map((ind, idx) => (
                                  <li key={idx} className="text-gray-600">• {ind}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-2">⚠️ {t('rec_worsening')}</p>
                              <ul className="text-sm space-y-1">
                                {recomendacion.contenido.seguimiento.indicadores_empeoramiento?.map((ind, idx) => (
                                  <li key={idx} className="text-gray-600">• {ind}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mensaje personalizado */}
                    {recomendacion.contenido.mensaje_personalizado && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-500 mb-1">💬 {t('rec_personal_message')}</p>
                        {/* mensaje_personalizado is AI-generated content kept as-is */}
                        <p className="text-gray-700 italic">"{recomendacion.contenido.mensaje_personalizado}"</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorRecomendacionesIA;
