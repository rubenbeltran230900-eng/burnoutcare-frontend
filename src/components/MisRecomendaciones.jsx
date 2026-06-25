import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, RefreshCw, Smile, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { evaluacionesService, recomendacionesService } from '../services/api';

const colorNivel = (nivel) => {
  if (nivel === 'Alto') return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500' };
  if (nivel === 'Medio') return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' };
  return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800', bar: 'bg-green-500' };
};

// 'Alto', 'Medio', 'Bajo' are internal level values (data identifiers) used for color mapping — kept as-is
const determinarNivel = (puntaje) => {
  if (puntaje < 50) return 'Bajo';
  if (puntaje < 75) return 'Medio';
  return 'Alto';
};

const nivelGeneral = (ev) => {
  const niveles = [determinarNivel(ev.puntaje_bp), determinarNivel(ev.puntaje_bl), determinarNivel(ev.puntaje_bc)];
  if (niveles.includes('Alto')) return 'Alto';
  if (niveles.includes('Medio')) return 'Medio';
  return 'Bajo';
};

const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-MX', {
  day: 'numeric', month: 'long', year: 'numeric'
});

// Emoji map by level key — level keys are data identifiers kept as-is
const emojiNivel = { Alto: '😔', Medio: '😐', Bajo: '😊' };

// BP, BL, BC are CBI dimension abbreviations (data identifiers) kept as-is
const DIMENSIONS = ['BP', 'BL', 'BC'];
const DIM_SCORES = { BP: 'puntaje_bp', BL: 'puntaje_bl', BC: 'puntaje_bc' };

const MisRecomendaciones = ({ usuario }) => {
  const { t } = useTranslation();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [recomendacion, setRecomendacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [expandido, setExpandido] = useState(null);

  // Build dimension info using t() inside the component
  const dimensionInfo = {
    BP: { nombre: t('dim_personal'), desc: t('dim_personal_desc') },
    BL: { nombre: t('dim_work'), desc: t('dim_work_desc') },
    BC: { nombre: t('dim_client'), desc: t('dim_client_desc') }
  };

  // Level messages using t() — 'Alto'/'Medio'/'Bajo' are data keys kept as-is
  const mensajeNivel = {
    Alto: t('my_rec_msg_high'),
    Medio: t('my_rec_msg_medium'),
    Bajo: t('my_rec_msg_low')
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await evaluacionesService.obtenerTodas({ usuario_id: usuario.id });
      const lista = (data.data || data.evaluaciones || data || [])
       .filter(e => String(e.usuario_id) === String(usuario.id))
        .sort((a, b) => new Date(b.created_at || b.fecha) - new Date(a.created_at || a.fecha));
      setEvaluaciones(lista);

      if (lista.length > 0) {
        try {
          const rec = await recomendacionesService.obtenerPorEvaluacion(lista[0].id);
          if (rec.success && rec.data) setRecomendacion(rec.data);
        } catch {
          // No hay recomendación aún
        }
      }
    } catch (err) {
      setError(t('msg_connection_error'));
    } finally {
      setCargando(false);
    }
  };

  const generarRecomendacion = async (evaluacionId) => {
    setGenerando(true);
    setError('');
    try {
      const response = await recomendacionesService.generar(evaluacionId);
      if (response.success) {
        setRecomendacion(response.data);
      } else {
        setError(response.error || t('msg_connection_error'));
      }
    } catch {
      setError(t('msg_connection_error'));
    } finally {
      setGenerando(false);
    }
  };

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p>{t('my_rec_loading')}</p>
      </div>
    </div>
  );

  if (evaluaciones.length === 0) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Smile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('my_rec_no_evals')}</h2>
        <p className="text-gray-500">{t('my_rec_no_evals_desc')}</p>
      </div>
    </div>
  );

  const ultima = evaluaciones[0];
  const nivel = nivelGeneral(ultima);
  const c = colorNivel(nivel);

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Tarjeta principal */}
      <div className={`rounded-xl shadow-lg p-8 border ${c.bg} ${c.border}`}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{emojiNivel[nivel]}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {/* usuario.nombre is personal user data kept as-is */}
            {t('my_rec_greeting', { name: usuario.nombre.split(' ')[0] })}
          </h1>
          <p className={`text-lg font-medium ${c.text}`}>{mensajeNivel[nivel]}</p>
          <p className="text-gray-400 text-sm mt-2">
            {t('my_rec_last_eval')} {formatFecha(ultima.created_at || ultima.fecha)}
          </p>
        </div>

        {/* Puntajes por dimensión */}
        <div className="space-y-3 mb-6">
          {DIMENSIONS.map((dim) => {
            const puntaje = ultima[DIM_SCORES[dim]];
            const n = determinarNivel(puntaje);
            const dc = colorNivel(n);
            return (
              <div key={dim} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{dimensionInfo[dim].nombre}</p>
                    <p className="text-xs text-gray-500">{dimensionInfo[dim].desc}</p>
                  </div>
                  {/* n is a data identifier ('Alto'/'Medio'/'Bajo') kept as-is for color mapping; display uses t() */}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${dc.badge}`}>
                    {n === 'Alto' ? t('risk_high') : n === 'Medio' ? t('risk_medium') : t('risk_low')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${dc.bar}`} style={{ width: `${puntaje}%` }} />
                </div>
                <p className="text-right text-xs text-gray-400 mt-1">{puntaje}/100</p>
              </div>
            );
          })}
        </div>

        {/* Sección recomendaciones IA */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              {t('my_rec_personalized')}
            </h2>
            <button
              onClick={() => generarRecomendacion(ultima.id)}
              disabled={generando}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition disabled:opacity-50"
            >
              {generando
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('my_rec_generating')}</>
                : <><Brain className="w-4 h-4" /> {recomendacion ? t('my_rec_update') : t('my_rec_generate')}</>}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {!recomendacion && !generando && (
            <div className="text-center py-6 text-gray-400">
              <Brain className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('my_rec_generate_hint')}</p>
            </div>
          )}

          {recomendacion && recomendacion.contenido && (
            <div className="space-y-4">
              {recomendacion.contenido.mensaje_personalizado && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-500 mb-1 font-medium">💬 {t('my_rec_message_for_you')}</p>
                  {/* mensaje_personalizado is AI-generated content kept as-is */}
                  <p className="text-gray-700 italic">"{recomendacion.contenido.mensaje_personalizado}"</p>
                </div>
              )}

              {recomendacion.contenido.tecnicas_autocuidado && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">🌿 {t('my_rec_selfcare')}</h3>
                  <ul className="space-y-2">
                    {recomendacion.contenido.tecnicas_autocuidado.map((tecnica, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{tecnica}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recomendacion.contenido.recomendaciones_inmediatas && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">⚡ {t('my_rec_immediate')}</h3>
                  <ul className="space-y-2">
                    {recomendacion.contenido.recomendaciones_inmediatas.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-500 font-bold text-sm flex-shrink-0">{idx + 1}.</span>
                        {/* rec.accion is backend AI-generated content kept as-is */}
                        <span className="text-gray-700 text-sm">{rec.accion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Historial */}
      {evaluaciones.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('my_rec_history')}</h2>
          <div className="space-y-3">
            {evaluaciones.slice(1).map((ev, i) => {
              const n = nivelGeneral(ev);
              const dc = colorNivel(n);
              const abierto = expandido === i;
              return (
                <div key={ev.id} className={`border rounded-lg overflow-hidden ${dc.border}`}>
                  <button
                    onClick={() => setExpandido(abierto ? null : i)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {n === 'Alto'
                        ? <AlertTriangle className="w-4 h-4 text-red-500" />
                        : n === 'Medio'
                        ? <Smile className="w-4 h-4 text-yellow-500" />
                        : <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span className="text-sm text-gray-700">{formatFecha(ev.created_at || ev.fecha)}</span>
                      {/* n display uses t() for localized label */}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dc.badge}`}>
                        {n === 'Alto' ? t('risk_high') : n === 'Medio' ? t('risk_medium') : t('risk_low')}
                      </span>
                    </div>
                    {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {abierto && (
                    <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                      {DIMENSIONS.map((dim) => {
                        const p = ev[DIM_SCORES[dim]];
                        const dn = determinarNivel(p);
                        const ddc = colorNivel(dn);
                        return (
                          <div key={dim} className={`rounded-lg p-3 text-center ${ddc.bg}`}>
                            {/* dim abbreviation (BP/BL/BC) is a data identifier kept as-is */}
                            <p className="text-xs text-gray-500">{dim}</p>
                            <p className={`text-xl font-bold ${ddc.text}`}>{p}</p>
                            <p className={`text-xs font-medium ${ddc.text}`}>
                              {dn === 'Alto' ? t('risk_high') : dn === 'Medio' ? t('risk_medium') : t('risk_low')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisRecomendaciones;
