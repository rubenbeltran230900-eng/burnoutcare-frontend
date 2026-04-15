import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw, Smile, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { evaluacionesService, recomendacionesService } from '../services/api';

const colorNivel = (nivel) => {
  if (nivel === 'Alto') return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500' };
  if (nivel === 'Medio') return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' };
  return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800', bar: 'bg-green-500' };
};

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

const emojiNivel = { Alto: '😔', Medio: '😐', Bajo: '😊' };
const mensajeNivel = {
  Alto: 'Tu nivel de burnout es alto. Es importante que tomes acción y busques apoyo pronto.',
  Medio: 'Estás experimentando señales de estrés. Es un buen momento para hacer pausas y cuidarte.',
  Bajo: '¡Vas muy bien! Tu nivel de burnout es bajo. Sigue cuidando tu bienestar.'
};

const dimensionInfo = {
  BP: { nombre: 'Burnout Personal', desc: 'Agotamiento físico y emocional general' },
  BL: { nombre: 'Burnout Laboral', desc: 'Agotamiento relacionado con el trabajo' },
  BC: { nombre: 'Burnout por Clientes', desc: 'Agotamiento en el trato con personas' }
};

const MisRecomendaciones = ({ usuario }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [recomendacion, setRecomendacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await evaluacionesService.obtenerTodas();
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
      setError('No se pudieron cargar tus evaluaciones.');
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
        setError(response.error || 'Error al generar recomendación.');
      }
    } catch {
      setError('Error al conectar con el servidor.');
    } finally {
      setGenerando(false);
    }
  };

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p>Cargando tus resultados...</p>
      </div>
    </div>
  );

  if (evaluaciones.length === 0) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Smile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Aún no tienes evaluaciones</h2>
        <p className="text-gray-500">Completa tu primera evaluación CBI para ver tus recomendaciones personalizadas.</p>
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
            Hola, {usuario.nombre.split(' ')[0]}
          </h1>
          <p className={`text-lg font-medium ${c.text}`}>{mensajeNivel[nivel]}</p>
          <p className="text-gray-400 text-sm mt-2">
            Última evaluación: {formatFecha(ultima.created_at || ultima.fecha)}
          </p>
        </div>

        {/* Puntajes por dimensión */}
        <div className="space-y-3 mb-6">
          {[['BP', ultima.puntaje_bp], ['BL', ultima.puntaje_bl], ['BC', ultima.puntaje_bc]].map(([dim, puntaje]) => {
            const n = determinarNivel(puntaje);
            const dc = colorNivel(n);
            return (
              <div key={dim} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{dimensionInfo[dim].nombre}</p>
                    <p className="text-xs text-gray-500">{dimensionInfo[dim].desc}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${dc.badge}`}>{n}</span>
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
              Recomendaciones personalizadas
            </h2>
            <button
              onClick={() => generarRecomendacion(ultima.id)}
              disabled={generando}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition disabled:opacity-50"
            >
              {generando
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generando...</>
                : <><Brain className="w-4 h-4" /> {recomendacion ? 'Actualizar' : 'Generar con IA'}</>}
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
              <p className="text-sm">Presiona "Generar con IA" para obtener recomendaciones personalizadas basadas en tus resultados.</p>
            </div>
          )}

          {recomendacion && recomendacion.contenido && (
            <div className="space-y-4">
              {recomendacion.contenido.mensaje_personalizado && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-500 mb-1 font-medium">💬 Mensaje para ti</p>
                  <p className="text-gray-700 italic">"{recomendacion.contenido.mensaje_personalizado}"</p>
                </div>
              )}

              {recomendacion.contenido.tecnicas_autocuidado && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">🌿 Técnicas de autocuidado</h3>
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
                  <h3 className="font-medium text-gray-700 mb-3">⚡ Acciones que puedes tomar ahora</h3>
                  <ul className="space-y-2">
                    {recomendacion.contenido.recomendaciones_inmediatas.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-500 font-bold text-sm flex-shrink-0">{idx + 1}.</span>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de evaluaciones</h2>
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
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dc.badge}`}>{n}</span>
                    </div>
                    {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {abierto && (
                    <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                      {[['BP', ev.puntaje_bp], ['BL', ev.puntaje_bl], ['BC', ev.puntaje_bc]].map(([dim, p]) => {
                        const dn = determinarNivel(p);
                        const ddc = colorNivel(dn);
                        return (
                          <div key={dim} className={`rounded-lg p-3 text-center ${ddc.bg}`}>
                            <p className="text-xs text-gray-500">{dim}</p>
                            <p className={`text-xl font-bold ${ddc.text}`}>{p}</p>
                            <p className={`text-xs font-medium ${ddc.text}`}>{dn}</p>
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