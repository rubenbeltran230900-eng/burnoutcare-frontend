import React, { useState } from 'react';
import { ClipboardList, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, User, Briefcase, Building } from 'lucide-react';
import { evaluacionesService } from '../services/api';

const preguntasCBI = [
  { id: 1, dimension: 'BP', texto: '¿Con qué frecuencia te sientes cansado/a?' },
  { id: 2, dimension: 'BP', texto: '¿Con qué frecuencia estás físicamente agotado/a?' },
  { id: 3, dimension: 'BP', texto: '¿Con qué frecuencia estás emocionalmente agotado/a?' },
  { id: 4, dimension: 'BP', texto: '¿Con qué frecuencia piensas "No puedo más"?' },
  { id: 5, dimension: 'BP', texto: '¿Con qué frecuencia te sientes agotado/a?' },
  { id: 6, dimension: 'BP', texto: '¿Con qué frecuencia te sientes débil y susceptible a enfermarte?' },
  { id: 7, dimension: 'BL', texto: '¿Tu trabajo es emocionalmente agotador?' },
  { id: 8, dimension: 'BL', texto: '¿Te sientes agotado/a por tu trabajo?' },
  { id: 9, dimension: 'BL', texto: '¿Tu trabajo te frustra?' },
  { id: 10, dimension: 'BL', texto: '¿Te sientes agotado/a al final de la jornada laboral?' },
  { id: 11, dimension: 'BL', texto: '¿Te sientes exhausto/a en la mañana al pensar en otro día de trabajo?' },
  { id: 12, dimension: 'BL', texto: '¿Sientes que cada hora de trabajo es cansadora para ti?' },
  { id: 13, dimension: 'BL', texto: '¿Tienes suficiente energía para la familia y amigos durante el tiempo libre?' },
  { id: 14, dimension: 'BC', texto: '¿Te resulta difícil trabajar con clientes/usuarios?' },
  { id: 15, dimension: 'BC', texto: '¿Te agota trabajar con clientes/usuarios?' },
  { id: 16, dimension: 'BC', texto: '¿Te frustra trabajar con clientes/usuarios?' },
  { id: 17, dimension: 'BC', texto: '¿Sientes que das más de lo que recibes al trabajar con clientes/usuarios?' },
  { id: 18, dimension: 'BC', texto: '¿Estás cansado/a de trabajar con clientes/usuarios?' },
  { id: 19, dimension: 'BC', texto: '¿Te preguntas cuánto tiempo más podrás seguir trabajando con clientes/usuarios?' }
];

const opcionesRespuesta = [
  { valor: 0,   texto: 'Nunca / Casi nunca', color: 'bg-green-100 border-green-300 text-green-800' },
  { valor: 25,  texto: 'Rara vez',           color: 'bg-lime-100 border-lime-300 text-lime-800' },
  { valor: 50,  texto: 'A veces',            color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { valor: 75,  texto: 'Frecuentemente',     color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { valor: 100, texto: 'Siempre',            color: 'bg-red-100 border-red-300 text-red-800' }
];

const opcionesEdad        = ['18-25', '26-35', '36-45', '46-55', '56+'];
const opcionesGenero      = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decir'];
const opcionesEducacion   = ['Preparatoria / Bachillerato', 'Técnico', 'Licenciatura', 'Maestría', 'Doctorado'];
const opcionesSector      = ['Sector privado', 'Sector público', 'ONG / Sin fines de lucro'];
const opcionesIndustria   = ['Manufactura', 'Salud', 'Educación', 'Construcción / Ingeniería', 'Servicios', 'Otro'];
const opcionesPuesto      = ['Operativo / Entrada', 'Especialista / Staff', 'Mandos medios', 'Dirección / Liderazgo'];
const opcionesExperiencia = ['Menos de 1 año', '1-3 años', '4-7 años', '8+ años'];
const opcionesHoras       = ['Menos de 40h', '40-48h', 'Más de 48h'];
const opcionesModalidad   = ['Presencial', 'Remoto / Teletrabajo', 'Híbrido'];

const ModuloEvaluacionCBI = ({ usuario, onCambiarModulo }) => {
  const [paso, setPaso] = useState('inicio');
  const [datosColaborador, setDatosColaborador] = useState({ nombre: '', area: '', puesto: '' });
  const [demograficos, setDemograficos] = useState({
    edad: '', genero: '', educacion: '', sector: '',
    industria: '', industria_otro: '', nivel_puesto: '',
    experiencia: '', horas_semanales: '', modalidad: ''
  });
  const [cualitativos, setCualitativos] = useState({
    factores_ambiente: '', soporte_organizacional: '', comentarios: ''
  });
  const [respuestas, setRespuestas] = useState({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const calcularPuntajes = () => {
    const dimensiones = { BP: [], BL: [], BC: [] };
    preguntasCBI.forEach(p => {
      if (respuestas[p.id] !== undefined) {
        let valor = respuestas[p.id];
        if (p.id === 13) valor = 100 - valor;
        dimensiones[p.dimension].push(valor);
      }
    });
    const avg = arr => arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    return { BP: avg(dimensiones.BP), BL: avg(dimensiones.BL), BC: avg(dimensiones.BC) };
  };

  const determinarNivel = (puntaje) => {
    if (puntaje < 50) return { nivel: 'Bajo',  color: 'text-green-600',  bg: 'bg-green-100' };
    if (puntaje < 75) return { nivel: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return              { nivel: 'Alto',  color: 'text-red-600',    bg: 'bg-red-100' };
  };

  const handleRespuesta = (valor) => {
    setRespuestas({ ...respuestas, [preguntasCBI[preguntaActual].id]: valor });
    if (preguntaActual < preguntasCBI.length - 1) setPreguntaActual(preguntaActual + 1);
  };

  const demograficosCompletos = () =>
    demograficos.edad && demograficos.genero && demograficos.educacion &&
    demograficos.sector && demograficos.industria && demograficos.nivel_puesto &&
    demograficos.experiencia && demograficos.horas_semanales && demograficos.modalidad;

  const finalizarEvaluacion = async () => {
    const puntajes = calcularPuntajes();
    const nivelBP = determinarNivel(puntajes.BP);
    const nivelBL = determinarNivel(puntajes.BL);
    const nivelBC = determinarNivel(puntajes.BC);

    let nivelGeneral = 'Bajo';
    if (nivelBP.nivel === 'Alto' || nivelBL.nivel === 'Alto' || nivelBC.nivel === 'Alto') nivelGeneral = 'Alto';
    else if (nivelBP.nivel === 'Medio' || nivelBL.nivel === 'Medio' || nivelBC.nivel === 'Medio') nivelGeneral = 'Medio';

    setResultado({ puntajes, niveles: { BP: nivelBP, BL: nivelBL, BC: nivelBC }, nivelGeneral, fecha: new Date().toISOString() });
    setGuardando(true);
    setError('');

    try {
      await evaluacionesService.crear({
        usuario_id: usuario.id,
        respuestas: {
          demograficos: {
            ...demograficos,
            industria: demograficos.industria === 'Otro' ? demograficos.industria_otro : demograficos.industria
          },
          cbi: respuestas,
          cualitativos
        },
        puntaje_bp: puntajes.BP,
        puntaje_bl: puntajes.BL,
        puntaje_bc: puntajes.BC
      });
      setPaso('resultado');
    } catch (err) {
      setError('Error al guardar la evaluación. Intenta de nuevo.');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const reiniciarEvaluacion = () => {
    setPaso('inicio');
    setDatosColaborador({ nombre: '', area: '', puesto: '' });
    setDemograficos({ edad: '', genero: '', educacion: '', sector: '', industria: '', industria_otro: '', nivel_puesto: '', experiencia: '', horas_semanales: '', modalidad: '' });
    setCualitativos({ factores_ambiente: '', soporte_organizacional: '', comentarios: '' });
    setRespuestas({});
    setPreguntaActual(0);
    setResultado(null);
    setError('');
  };

  const SelectField = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Selecciona una opción...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  // ── INICIO ──────────────────────────────────────────────
  if (paso === 'inicio') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ClipboardList className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Evaluación de Burnout</h1>
          <p className="text-gray-600">Copenhagen Burnout Inventory (CBI)</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-blue-800 mb-3">Acerca del CBI</h2>
          <p className="text-blue-700 text-sm mb-4">
            El Copenhagen Burnout Inventory es un instrumento validado científicamente que evalúa
            tres dimensiones del burnout: personal, laboral y relacionado con clientes/usuarios.
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Perfil demográfico y ocupacional</li>
            <li>• 19 preguntas del CBI</li>
            <li>• 3 preguntas de contexto cualitativo</li>
            <li>• Tiempo estimado: 10-15 minutos</li>
            <li>• Completamente confidencial</li>
          </ul>
        </div>
        <button onClick={() => setPaso('datos')}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
          Comenzar Evaluación <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // ── DATOS BÁSICOS ────────────────────────────────────────
  if (paso === 'datos') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Datos del Colaborador</h2>
        <p className="text-gray-500 text-sm mb-6">Paso 1 de 4</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" /> Nombre completo
            </label>
            <input type="text" value={datosColaborador.nombre}
              onChange={e => setDatosColaborador({ ...datosColaborador, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu nombre" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building className="w-4 h-4 inline mr-1" /> Área / Departamento
            </label>
            <input type="text" value={datosColaborador.area}
              onChange={e => setDatosColaborador({ ...datosColaborador, area: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Recursos Humanos, Ventas..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Briefcase className="w-4 h-4 inline mr-1" /> Puesto
            </label>
            <input type="text" value={datosColaborador.puesto}
              onChange={e => setDatosColaborador({ ...datosColaborador, puesto: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Analista, Coordinador..." />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={() => setPaso('inicio')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" /> Volver
          </button>
          <button onClick={() => setPaso('demograficos')} disabled={!datosColaborador.nombre}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Continuar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── SECCIÓN 1: DEMOGRÁFICOS ──────────────────────────────
  if (paso === 'demograficos') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Sección 1: Perfil Demográfico y Ocupacional</h2>
        <p className="text-gray-500 text-sm mb-2">Paso 2 de 4</p>
        <p className="text-gray-500 text-sm mb-6">
          Esta información es anónima y se usa para identificar patrones organizacionales.
        </p>
        <div className="space-y-4">
          <SelectField label="1. Rango de edad" value={demograficos.edad}
            onChange={v => setDemograficos({ ...demograficos, edad: v })} options={opcionesEdad} />
          <SelectField label="2. Género" value={demograficos.genero}
            onChange={v => setDemograficos({ ...demograficos, genero: v })} options={opcionesGenero} />
          <SelectField label="3. Nivel educativo más alto" value={demograficos.educacion}
            onChange={v => setDemograficos({ ...demograficos, educacion: v })} options={opcionesEducacion} />
          <SelectField label="4. Sector de trabajo" value={demograficos.sector}
            onChange={v => setDemograficos({ ...demograficos, sector: v })} options={opcionesSector} />
          <SelectField label="5. Industria / Campo" value={demograficos.industria}
            onChange={v => setDemograficos({ ...demograficos, industria: v })} options={opcionesIndustria} />
          {demograficos.industria === 'Otro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especifica tu industria</label>
              <input type="text" value={demograficos.industria_otro}
                onChange={e => setDemograficos({ ...demograficos, industria_otro: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe tu industria..." />
            </div>
          )}
          <SelectField label="6. Nivel de puesto" value={demograficos.nivel_puesto}
            onChange={v => setDemograficos({ ...demograficos, nivel_puesto: v })} options={opcionesPuesto} />
          <SelectField label="7. Años de experiencia en posición actual" value={demograficos.experiencia}
            onChange={v => setDemograficos({ ...demograficos, experiencia: v })} options={opcionesExperiencia} />
          <SelectField label="8. Horas de trabajo promedio por semana" value={demograficos.horas_semanales}
            onChange={v => setDemograficos({ ...demograficos, horas_semanales: v })} options={opcionesHoras} />
          <SelectField label="9. Modalidad de trabajo" value={demograficos.modalidad}
            onChange={v => setDemograficos({ ...demograficos, modalidad: v })} options={opcionesModalidad} />
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={() => setPaso('datos')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" /> Volver
          </button>
          <button onClick={() => setPaso('evaluacion')} disabled={!demograficosCompletos()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Continuar al CBI <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── SECCIÓN 2: CBI ───────────────────────────────────────
  if (paso === 'evaluacion') {
    const pregunta = preguntasCBI[preguntaActual];
    const progreso = ((preguntaActual + 1) / preguntasCBI.length) * 100;
    const dimensionTexto = { BP: 'Burnout Personal', BL: 'Burnout Laboral', BC: 'Burnout por Cliente' };
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-gray-500 text-sm mb-4">Sección 2: CBI — Paso 3 de 4</p>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pregunta {preguntaActual + 1} de {preguntasCBI.length}</span>
              <span>{Math.round(progreso)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {dimensionTexto[pregunta.dimension]}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{pregunta.texto}</h2>
          <div className="space-y-3">
            {opcionesRespuesta.map(opcion => (
              <button key={opcion.valor} onClick={() => handleRespuesta(opcion.valor)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:scale-[1.02] ${
                  respuestas[pregunta.id] === opcion.valor
                    ? opcion.color + ' border-current'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                {opcion.texto}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => preguntaActual > 0 ? setPreguntaActual(preguntaActual - 1) : setPaso('demograficos')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
            {preguntaActual === preguntasCBI.length - 1 && respuestas[pregunta.id] !== undefined && (
              <button onClick={() => setPaso('cualitativos')}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        </div>
      </div>
    );
  }

  // ── SECCIÓN 3: CUALITATIVOS ──────────────────────────────
  if (paso === 'cualitativos') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Sección 3: Contexto Cualitativo</h2>
        <p className="text-gray-500 text-sm mb-2">Paso 4 de 4 — Opcional</p>
        <p className="text-gray-500 text-sm mb-6">
          Tus respuestas ayudan al equipo a entender los factores organizacionales detrás de los datos.
        </p>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1. Factores del ambiente de trabajo
            </label>
            <p className="text-xs text-gray-500 mb-2">
              ¿Cuáles son los principales factores en tu entorno laboral (carga de trabajo, liderazgo, recursos) que más contribuyen a tu estrés o bienestar?
            </p>
            <textarea value={cualitativos.factores_ambiente}
              onChange={e => setCualitativos({ ...cualitativos, factores_ambiente: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe tu respuesta aquí (opcional)..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              2. Soporte organizacional
            </label>
            <p className="text-xs text-gray-500 mb-2">
              ¿Qué cambios, herramientas o sistemas de apoyo crees que tu organización podría implementar para prevenir mejor el burnout?
            </p>
            <textarea value={cualitativos.soporte_organizacional}
              onChange={e => setCualitativos({ ...cualitativos, soporte_organizacional: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe tu respuesta aquí (opcional)..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              3. Comentarios adicionales
            </label>
            <p className="text-xs text-gray-500 mb-2">
              ¿Hay algo más que quieras compartir sobre tu experiencia con el estrés laboral que no fue cubierto en las preguntas anteriores?
            </p>
            <textarea value={cualitativos.comentarios}
              onChange={e => setCualitativos({ ...cualitativos, comentarios: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe tu respuesta aquí (opcional)..." />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={() => setPaso('evaluacion')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" /> Volver
          </button>
          <button onClick={finalizarEvaluacion} disabled={guardando}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Finalizar Evaluación'}
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );

  // ── RESULTADO ────────────────────────────────────────────
  if (paso === 'resultado' && resultado) {
    const { puntajes, niveles, nivelGeneral } = resultado;
    const colorGeneral = nivelGeneral === 'Alto' ? 'red' : nivelGeneral === 'Medio' ? 'yellow' : 'green';
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-${colorGeneral}-100 rounded-full mb-4`}>
              {nivelGeneral === 'Alto'
                ? <AlertTriangle className={`w-8 h-8 text-${colorGeneral}-600`} />
                : <CheckCircle className={`w-8 h-8 text-${colorGeneral}-600`} />}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Resultados de la Evaluación</h1>
            <p className="text-gray-600">Copenhagen Burnout Inventory</p>
          </div>
          <div className={`p-6 rounded-lg mb-6 bg-${colorGeneral}-50 border border-${colorGeneral}-200`}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Nivel de Riesgo General</h2>
            <p className={`text-3xl font-bold text-${colorGeneral}-600`}>{nivelGeneral}</p>
          </div>
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-800">Resultados por Dimensión</h3>
            <div className="grid gap-4">
              {[
                { key: 'BP', label: 'Burnout Personal', desc: 'Agotamiento físico y emocional general' },
                { key: 'BL', label: 'Burnout Laboral', desc: 'Agotamiento relacionado con el trabajo' },
                { key: 'BC', label: 'Burnout por Cliente/Usuario', desc: 'Agotamiento en el trato con personas' }
              ].map(({ key, label, desc }) => (
                <div key={key} className={`p-4 rounded-lg ${niveles[key].bg}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{label}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${niveles[key].color}`}>{puntajes[key]}</p>
                      <p className={`text-sm font-medium ${niveles[key].color}`}>{niveles[key].nivel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Interpretación de puntajes</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-green-100 rounded"><p className="font-medium text-green-700">0-49</p><p className="text-green-600">Bajo</p></div>
              <div className="text-center p-2 bg-yellow-100 rounded"><p className="font-medium text-yellow-700">50-74</p><p className="text-yellow-600">Medio</p></div>
              <div className="text-center p-2 bg-red-100 rounded"><p className="font-medium text-red-700">75-100</p><p className="text-red-600">Alto</p></div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={reiniciarEvaluacion}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Nueva Evaluación
            </button>
            <button onClick={() => onCambiarModulo('recomendaciones')}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Ver Recomendaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ModuloEvaluacionMBI;