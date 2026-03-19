import React, { useState } from 'react';
import { ClipboardList, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, User, Briefcase, Building } from 'lucide-react';
import { evaluacionesService } from '../services/api';

// Preguntas del Copenhagen Burnout Inventory (CBI)
const preguntasCBI = [
  // Burnout Personal (6 preguntas)
  { id: 1, dimension: 'BP', texto: '¿Con qué frecuencia te sientes cansado/a?' },
  { id: 2, dimension: 'BP', texto: '¿Con qué frecuencia estás físicamente agotado/a?' },
  { id: 3, dimension: 'BP', texto: '¿Con qué frecuencia estás emocionalmente agotado/a?' },
  { id: 4, dimension: 'BP', texto: '¿Con qué frecuencia piensas "No puedo más"?' },
  { id: 5, dimension: 'BP', texto: '¿Con qué frecuencia te sientes agotado/a?' },
  { id: 6, dimension: 'BP', texto: '¿Con qué frecuencia te sientes débil y susceptible a enfermarte?' },
  
  // Burnout Laboral (7 preguntas)
  { id: 7, dimension: 'BL', texto: '¿Tu trabajo es emocionalmente agotador?' },
  { id: 8, dimension: 'BL', texto: '¿Te sientes agotado/a por tu trabajo?' },
  { id: 9, dimension: 'BL', texto: '¿Tu trabajo te frustra?' },
  { id: 10, dimension: 'BL', texto: '¿Te sientes agotado/a al final de la jornada laboral?' },
  { id: 11, dimension: 'BL', texto: '¿Te sientes exhausto/a en la mañana al pensar en otro día de trabajo?' },
  { id: 12, dimension: 'BL', texto: '¿Sientes que cada hora de trabajo es cansadora para ti?' },
  { id: 13, dimension: 'BL', texto: '¿Tienes suficiente energía para la familia y amigos durante el tiempo libre?' },
  
  // Burnout por Cliente/Usuario (6 preguntas)
  { id: 14, dimension: 'BC', texto: '¿Te resulta difícil trabajar con clientes/usuarios?' },
  { id: 15, dimension: 'BC', texto: '¿Te agota trabajar con clientes/usuarios?' },
  { id: 16, dimension: 'BC', texto: '¿Te frustra trabajar con clientes/usuarios?' },
  { id: 17, dimension: 'BC', texto: '¿Sientes que das más de lo que recibes al trabajar con clientes/usuarios?' },
  { id: 18, dimension: 'BC', texto: '¿Estás cansado/a de trabajar con clientes/usuarios?' },
  { id: 19, dimension: 'BC', texto: '¿Te preguntas cuánto tiempo más podrás seguir trabajando con clientes/usuarios?' }
];

// Opciones de respuesta CBI (escala de 5 puntos)
const opcionesRespuesta = [
  { valor: 0, texto: 'Nunca / Casi nunca', color: 'bg-green-100 border-green-300 text-green-800' },
  { valor: 25, texto: 'Rara vez', color: 'bg-lime-100 border-lime-300 text-lime-800' },
  { valor: 50, texto: 'A veces', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { valor: 75, texto: 'Frecuentemente', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { valor: 100, texto: 'Siempre', color: 'bg-red-100 border-red-300 text-red-800' }
];

const ModuloEvaluacionCBI = ({ usuario, onCambiarModulo }) => {
  const [paso, setPaso] = useState('inicio'); // inicio, datos, evaluacion, resultado
  const [datosColaborador, setDatosColaborador] = useState({
    nombre: '',
    area: '',
    puesto: ''
  });
  const [respuestas, setRespuestas] = useState({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Calcular puntajes por dimensión
  const calcularPuntajes = () => {
    const dimensiones = { BP: [], BL: [], BC: [] };
    
    preguntasCBI.forEach(pregunta => {
      if (respuestas[pregunta.id] !== undefined) {
        // La pregunta 13 tiene escala invertida
        let valor = respuestas[pregunta.id];
        if (pregunta.id === 13) {
          valor = 100 - valor;
        }
        dimensiones[pregunta.dimension].push(valor);
      }
    });

    const calcularPromedio = (arr) => {
      if (arr.length === 0) return 0;
      return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    };

    return {
      BP: calcularPromedio(dimensiones.BP),
      BL: calcularPromedio(dimensiones.BL),
      BC: calcularPromedio(dimensiones.BC)
    };
  };

  // Determinar nivel de riesgo
  const determinarNivel = (puntaje) => {
    if (puntaje < 50) return { nivel: 'Bajo', color: 'text-green-600', bg: 'bg-green-100' };
    if (puntaje < 75) return { nivel: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { nivel: 'Alto', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Manejar respuesta
  const handleRespuesta = (valor) => {
    setRespuestas({ ...respuestas, [preguntasCBI[preguntaActual].id]: valor });
    
    if (preguntaActual < preguntasCBI.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  // Finalizar evaluación
  const finalizarEvaluacion = async () => {
    const puntajes = calcularPuntajes();
    const nivelBP = determinarNivel(puntajes.BP);
    const nivelBL = determinarNivel(puntajes.BL);
    const nivelBC = determinarNivel(puntajes.BC);
    
    // Determinar nivel general
    let nivelGeneral = 'Bajo';
    if (nivelBP.nivel === 'Alto' || nivelBL.nivel === 'Alto' || nivelBC.nivel === 'Alto') {
      nivelGeneral = 'Alto';
    } else if (nivelBP.nivel === 'Medio' || nivelBL.nivel === 'Medio' || nivelBC.nivel === 'Medio') {
      nivelGeneral = 'Medio';
    }

    const resultadoFinal = {
      puntajes,
      niveles: { BP: nivelBP, BL: nivelBL, BC: nivelBC },
      nivelGeneral,
      fecha: new Date().toISOString()
    };

    setResultado(resultadoFinal);
    setGuardando(true);
    setError('');

    // Guardar en la API
    try {
      await evaluacionesService.crear({
        usuario_id: usuario.id,
        respuestas: respuestas,
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

  // Reiniciar evaluación
  const reiniciarEvaluacion = () => {
    setPaso('inicio');
    setDatosColaborador({ nombre: '', area: '', puesto: '' });
    setRespuestas({});
    setPreguntaActual(0);
    setResultado(null);
    setError('');
  };

  // Pantalla de inicio
  if (paso === 'inicio') {
    return (
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
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• 19 preguntas en total</li>
              <li>• Tiempo estimado: 5-10 minutos</li>
              <li>• Resultados inmediatos</li>
              <li>• Completamente confidencial</li>
            </ul>
          </div>

          <button
            onClick={() => setPaso('datos')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            Comenzar Evaluación
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de datos del colaborador
  if (paso === 'datos') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Datos del Colaborador</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-2" />
                Nombre completo
              </label>
              <input
                type="text"
                value={datosColaborador.nombre}
                onChange={(e) => setDatosColaborador({ ...datosColaborador, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building className="w-4 h-4 inline mr-2" />
                Área / Departamento
              </label>
              <input
                type="text"
                value={datosColaborador.area}
                onChange={(e) => setDatosColaborador({ ...datosColaborador, area: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Recursos Humanos, Ventas, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Puesto
              </label>
              <input
                type="text"
                value={datosColaborador.puesto}
                onChange={(e) => setDatosColaborador({ ...datosColaborador, puesto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Analista, Coordinador, etc."
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setPaso('inicio')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>
            <button
              onClick={() => setPaso('evaluacion')}
              disabled={!datosColaborador.nombre}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de evaluación
  if (paso === 'evaluacion') {
    const pregunta = preguntasCBI[preguntaActual];
    const progreso = ((preguntaActual + 1) / preguntasCBI.length) * 100;
    const dimensionTexto = {
      BP: 'Burnout Personal',
      BL: 'Burnout Laboral',
      BC: 'Burnout por Cliente'
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pregunta {preguntaActual + 1} de {preguntasCBI.length}</span>
              <span>{Math.round(progreso)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          {/* Dimensión */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {dimensionTexto[pregunta.dimension]}
            </span>
          </div>

          {/* Pregunta */}
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {pregunta.texto}
          </h2>

          {/* Opciones */}
          <div className="space-y-3">
            {opcionesRespuesta.map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => handleRespuesta(opcion.valor)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:scale-[1.02] ${
                  respuestas[pregunta.id] === opcion.valor
                    ? opcion.color + ' border-current'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {opcion.texto}
              </button>
            ))}
          </div>

          {/* Navegación */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => preguntaActual > 0 ? setPreguntaActual(preguntaActual - 1) : setPaso('datos')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
            
            {preguntaActual === preguntasCBI.length - 1 && respuestas[pregunta.id] !== undefined && (
              <button
                onClick={finalizarEvaluacion}
                disabled={guardando}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Finalizar'}
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pantalla de resultado
  if (paso === 'resultado' && resultado) {
    const { puntajes, niveles, nivelGeneral } = resultado;
    const colorGeneral = nivelGeneral === 'Alto' ? 'red' : nivelGeneral === 'Medio' ? 'yellow' : 'green';

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-${colorGeneral}-100 rounded-full mb-4`}>
              {nivelGeneral === 'Alto' ? (
                <AlertTriangle className={`w-8 h-8 text-${colorGeneral}-600`} />
              ) : (
                <CheckCircle className={`w-8 h-8 text-${colorGeneral}-600`} />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Resultados de la Evaluación</h1>
            <p className="text-gray-600">Copenhagen Burnout Inventory</p>
          </div>

          {/* Nivel general */}
          <div className={`p-6 rounded-lg mb-6 bg-${colorGeneral}-50 border border-${colorGeneral}-200`}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Nivel de Riesgo General</h2>
            <p className={`text-3xl font-bold text-${colorGeneral}-600`}>{nivelGeneral}</p>
          </div>

          {/* Resultados por dimensión */}
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-800">Resultados por Dimensión</h3>
            
            <div className="grid gap-4">
              {/* Burnout Personal */}
              <div className={`p-4 rounded-lg ${niveles.BP.bg}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">Burnout Personal</p>
                    <p className="text-sm text-gray-600">Agotamiento físico y emocional general</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${niveles.BP.color}`}>{puntajes.BP}</p>
                    <p className={`text-sm font-medium ${niveles.BP.color}`}>{niveles.BP.nivel}</p>
                  </div>
                </div>
              </div>

              {/* Burnout Laboral */}
              <div className={`p-4 rounded-lg ${niveles.BL.bg}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">Burnout Laboral</p>
                    <p className="text-sm text-gray-600">Agotamiento relacionado con el trabajo</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${niveles.BL.color}`}>{puntajes.BL}</p>
                    <p className={`text-sm font-medium ${niveles.BL.color}`}>{niveles.BL.nivel}</p>
                  </div>
                </div>
              </div>

              {/* Burnout por Cliente */}
              <div className={`p-4 rounded-lg ${niveles.BC.bg}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">Burnout por Cliente/Usuario</p>
                    <p className="text-sm text-gray-600">Agotamiento en el trato con personas</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${niveles.BC.color}`}>{puntajes.BC}</p>
                    <p className={`text-sm font-medium ${niveles.BC.color}`}>{niveles.BC.nivel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interpretación */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Interpretación de puntajes</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-green-100 rounded">
                <p className="font-medium text-green-700">0-49</p>
                <p className="text-green-600">Bajo</p>
              </div>
              <div className="text-center p-2 bg-yellow-100 rounded">
                <p className="font-medium text-yellow-700">50-74</p>
                <p className="text-yellow-600">Medio</p>
              </div>
              <div className="text-center p-2 bg-red-100 rounded">
                <p className="font-medium text-red-700">75-100</p>
                <p className="text-red-600">Alto</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <button
              onClick={reiniciarEvaluacion}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Nueva Evaluación
            </button>
            <button
              onClick={() => onCambiarModulo('recomendaciones')}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ver Recomendaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ModuloEvaluacionCBI;