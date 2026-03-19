import React, { useState, useEffect } from 'react';
import { Activity, User, Calendar, Plus, Save, RefreshCw, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { evaluacionesService } from '../services/api';

const DashboardSeguimientoClinico = ({ usuario }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intervenciones, setIntervenciones] = useState({});
  const [nuevaIntervencion, setNuevaIntervencion] = useState({
    tipo: '',
    descripcion: '',
    fechaProgramada: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    cargarEvaluaciones();
    // Cargar intervenciones guardadas localmente (temporal hasta conectar con API)
    const intervencionesGuardadas = localStorage.getItem('intervenciones');
    if (intervencionesGuardadas) {
      setIntervenciones(JSON.parse(intervencionesGuardadas));
    }
  }, []);

  const cargarEvaluaciones = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await evaluacionesService.obtenerTodas();
      if (response.success) {
        // Filtrar solo casos de riesgo medio y alto para seguimiento
        const casosParaSeguimiento = response.data.filter(
          e => e.nivel_riesgo === 'Alto' || e.nivel_riesgo === 'Medio'
        );
        setEvaluaciones(casosParaSeguimiento);
        if (casosParaSeguimiento.length > 0 && !evaluacionSeleccionada) {
          setEvaluacionSeleccionada(casosParaSeguimiento[0]);
        }
      }
    } catch (err) {
      setError('Error al cargar evaluaciones');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const guardarIntervencion = () => {
    if (!nuevaIntervencion.tipo || !nuevaIntervencion.descripcion) {
      return;
    }

    const intervencion = {
      id: Date.now(),
      ...nuevaIntervencion,
      fechaCreacion: new Date().toISOString(),
      estado: 'pendiente',
      profesional: usuario.nombre
    };

    const nuevasIntervenciones = {
      ...intervenciones,
      [evaluacionSeleccionada.id]: [
        ...(intervenciones[evaluacionSeleccionada.id] || []),
        intervencion
      ]
    };

    setIntervenciones(nuevasIntervenciones);
    localStorage.setItem('intervenciones', JSON.stringify(nuevasIntervenciones));
    
    setNuevaIntervencion({ tipo: '', descripcion: '', fechaProgramada: '' });
    setMostrarFormulario(false);
  };

  const cambiarEstadoIntervencion = (evaluacionId, intervencionId, nuevoEstado) => {
    const nuevasIntervenciones = {
      ...intervenciones,
      [evaluacionId]: intervenciones[evaluacionId].map(i =>
        i.id === intervencionId ? { ...i, estado: nuevoEstado } : i
      )
    };
    setIntervenciones(nuevasIntervenciones);
    localStorage.setItem('intervenciones', JSON.stringify(nuevasIntervenciones));
  };

  const getColorRiesgo = (nivel) => {
    switch (nivel) {
      case 'Alto': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      case 'Medio': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
      case 'Bajo': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-700';
      case 'en_progreso': return 'bg-blue-100 text-blue-700';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const tiposIntervencion = [
    'Sesión individual',
    'Sesión grupal',
    'Derivación psicológica',
    'Ajuste de carga laboral',
    'Capacitación',
    'Seguimiento telefónico',
    'Reunión con jefe directo',
    'Otro'
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Seguimiento Clínico
          </h1>
          <p className="text-gray-600">Gestión de intervenciones para casos de riesgo medio y alto</p>
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

      {evaluaciones.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No hay casos que requieran seguimiento</h2>
          <p className="text-gray-500 mt-2">Los casos de riesgo medio y alto aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de casos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Casos en Seguimiento ({evaluaciones.length})
              </h2>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {evaluaciones.map((ev) => {
                  const color = getColorRiesgo(ev.nivel_riesgo);
                  const intervencionesCount = (intervenciones[ev.id] || []).length;
                  
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
                          <p className="font-medium text-gray-800">{ev.usuario_nombre}</p>
                          <p className="text-sm text-gray-500">{ev.area || 'Sin área'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
                          {ev.nivel_riesgo}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>{formatearFecha(ev.fecha)}</span>
                        {intervencionesCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {intervencionesCount} intervención(es)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detalle y seguimiento */}
          <div className="lg:col-span-2 space-y-6">
            {evaluacionSeleccionada && (
              <>
                {/* Info del caso */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{evaluacionSeleccionada.usuario_nombre}</h3>
                        <p className="text-sm text-gray-500">
                          {evaluacionSeleccionada.area} • {evaluacionSeleccionada.puesto}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${getColorRiesgo(evaluacionSeleccionada.nivel_riesgo).bg} ${getColorRiesgo(evaluacionSeleccionada.nivel_riesgo).text}`}>
                      Riesgo {evaluacionSeleccionada.nivel_riesgo}
                    </div>
                  </div>

                  {/* Puntajes CBI */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Burnout Personal</p>
                      <p className={`text-xl font-bold ${evaluacionSeleccionada.puntaje_bp >= 75 ? 'text-red-600' : evaluacionSeleccionada.puntaje_bp >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {evaluacionSeleccionada.puntaje_bp}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Burnout Laboral</p>
                      <p className={`text-xl font-bold ${evaluacionSeleccionada.puntaje_bl >= 75 ? 'text-red-600' : evaluacionSeleccionada.puntaje_bl >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {evaluacionSeleccionada.puntaje_bl}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Burnout Cliente</p>
                      <p className={`text-xl font-bold ${evaluacionSeleccionada.puntaje_bc >= 75 ? 'text-red-600' : evaluacionSeleccionada.puntaje_bc >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {evaluacionSeleccionada.puntaje_bc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Intervenciones */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Intervenciones
                    </h3>
                    <button
                      onClick={() => setMostrarFormulario(!mostrarFormulario)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva Intervención
                    </button>
                  </div>

                  {/* Formulario nueva intervención */}
                  {mostrarFormulario && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-gray-800 mb-3">Registrar Intervención</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de intervención
                          </label>
                          <select
                            value={nuevaIntervencion.tipo}
                            onChange={(e) => setNuevaIntervencion({ ...nuevaIntervencion, tipo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar...</option>
                            {tiposIntervencion.map((tipo) => (
                              <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha programada
                          </label>
                          <input
                            type="date"
                            value={nuevaIntervencion.fechaProgramada}
                            onChange={(e) => setNuevaIntervencion({ ...nuevaIntervencion, fechaProgramada: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción / Notas
                          </label>
                          <textarea
                            value={nuevaIntervencion.descripcion}
                            onChange={(e) => setNuevaIntervencion({ ...nuevaIntervencion, descripcion: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe la intervención planificada..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={guardarIntervencion}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4" />
                          Guardar
                        </button>
                        <button
                          onClick={() => setMostrarFormulario(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de intervenciones */}
                  <div className="space-y-3">
                    {(intervenciones[evaluacionSeleccionada.id] || []).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No hay intervenciones registradas para este caso
                      </p>
                    ) : (
                      (intervenciones[evaluacionSeleccionada.id] || [])
                        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
                        .map((intervencion) => (
                          <div key={intervencion.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">{intervencion.tipo}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${getColorEstado(intervencion.estado)}`}>
                                    {intervencion.estado === 'completada' ? 'Completada' :
                                     intervencion.estado === 'en_progreso' ? 'En progreso' :
                                     intervencion.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{intervencion.descripcion}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Creada: {formatearFecha(intervencion.fechaCreacion)}
                                  </span>
                                  {intervencion.fechaProgramada && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Programada: {formatearFecha(intervencion.fechaProgramada)}
                                    </span>
                                  )}
                                  <span>Por: {intervencion.profesional}</span>
                                </div>
                              </div>
                              <div>
                                <select
                                  value={intervencion.estado}
                                  onChange={(e) => cambiarEstadoIntervencion(evaluacionSeleccionada.id, intervencion.id, e.target.value)}
                                  className="text-xs border rounded px-2 py-1"
                                >
                                  <option value="pendiente">Pendiente</option>
                                  <option value="en_progreso">En progreso</option>
                                  <option value="completada">Completada</option>
                                  <option value="cancelada">Cancelada</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSeguimientoClinico;