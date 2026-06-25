import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, User, Briefcase, Building } from 'lucide-react';
import { evaluacionesService } from '../services/api';

const CONSENTIMIENTO_VERSION = '1.0-2026-06';

const ModuloEvaluacionMBI = ({ usuario, onCambiarModulo }) => {
  const { t } = useTranslation();

  const preguntasCBI = [
    { id: 1,  dimension: 'BP', texto: t('cbi_q1') },
    { id: 2,  dimension: 'BP', texto: t('cbi_q2') },
    { id: 3,  dimension: 'BP', texto: t('cbi_q3') },
    { id: 4,  dimension: 'BP', texto: t('cbi_q4') },
    { id: 5,  dimension: 'BP', texto: t('cbi_q5') },
    { id: 6,  dimension: 'BP', texto: t('cbi_q6') },
    { id: 7,  dimension: 'BL', texto: t('cbi_q7') },
    { id: 8,  dimension: 'BL', texto: t('cbi_q8') },
    { id: 9,  dimension: 'BL', texto: t('cbi_q9') },
    { id: 10, dimension: 'BL', texto: t('cbi_q10') },
    { id: 11, dimension: 'BL', texto: t('cbi_q11') },
    { id: 12, dimension: 'BL', texto: t('cbi_q12') },
    { id: 13, dimension: 'BL', texto: t('cbi_q13') },
    { id: 14, dimension: 'BC', texto: t('cbi_q14') },
    { id: 15, dimension: 'BC', texto: t('cbi_q15') },
    { id: 16, dimension: 'BC', texto: t('cbi_q16') },
    { id: 17, dimension: 'BC', texto: t('cbi_q17') },
    { id: 18, dimension: 'BC', texto: t('cbi_q18') },
    { id: 19, dimension: 'BC', texto: t('cbi_q19') },
  ];

  const opcionesRespuesta = [
    { valor: 0,   texto: t('answer_never'),     color: 'bg-green-100 border-green-300 text-green-800' },
    { valor: 25,  texto: t('answer_rarely'),    color: 'bg-lime-100 border-lime-300 text-lime-800' },
    { valor: 50,  texto: t('answer_sometimes'), color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { valor: 75,  texto: t('answer_often'),     color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { valor: 100, texto: t('answer_always'),    color: 'bg-red-100 border-red-300 text-red-800' },
  ];

  const opcionesEdad        = [t('age_18'), t('age_26'), t('age_36'), t('age_46'), t('age_56')];
  const opcionesGenero      = [t('gender_male'), t('gender_female'), t('gender_nb'), t('gender_na')];
  const opcionesEducacion   = [t('edu_hs'), t('edu_tech'), t('edu_bach'), t('edu_master'), t('edu_phd')];
  const opcionesSector      = [t('sector_private'), t('sector_public'), t('sector_ngo')];
  const opcionesIndustria   = [t('industry_mfg'), t('industry_health'), t('industry_edu'), t('industry_eng'), t('industry_svc'), t('industry_other')];
  const opcionesPuesto      = [t('level_entry'), t('level_staff'), t('level_mid'), t('level_exec')];
  const opcionesExperiencia = [t('exp_less1'), t('exp_1_3'), t('exp_4_7'), t('exp_8plus')];
  const opcionesHoras       = [t('hours_less40'), t('hours_40_48'), t('hours_more48')];
  const opcionesModalidad   = [t('mode_onsite'), t('mode_remote'), t('mode_hybrid')];

  const riskLabel = {
    'Bajo':  t('risk_low'),
    'Medio': t('risk_medium'),
    'Alto':  t('risk_high'),
  };

  const [paso, setPaso] = useState('inicio');
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false);
  const [consentimientoFecha, setConsentimientoFecha] = useState(null);
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
  const [evaluacionExistente, setEvaluacionExistente] = useState(null);

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
        consentimiento_aceptado: true,
        consentimiento_fecha: consentimientoFecha,
        consentimiento_version: CONSENTIMIENTO_VERSION,
        respuestas: {
          demograficos: {
            ...demograficos,
            industria: demograficos.industria === t('industry_other') ? demograficos.industria_otro : demograficos.industria
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
      if (err.codigo === 'DUPLICADO') {
        setEvaluacionExistente(err.data);
        setPaso('ya-completado');
      } else {
        setError(t('eval_save_error'));
      }
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const reiniciarEvaluacion = () => {
    setPaso('inicio');
    setConsentimientoAceptado(false);
    setConsentimientoFecha(null);
    setDatosColaborador({ nombre: '', area: '', puesto: '' });
    setDemograficos({ edad: '', genero: '', educacion: '', sector: '', industria: '', industria_otro: '', nivel_puesto: '', experiencia: '', horas_semanales: '', modalidad: '' });
    setCualitativos({ factores_ambiente: '', soporte_organizacional: '', comentarios: '' });
    setRespuestas({});
    setPreguntaActual(0);
    setResultado(null);
    setError('');
    setEvaluacionExistente(null);
  };

  const SelectField = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">{t('demo_select')}</option>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('eval_title')}</h1>
          <p className="text-gray-600">{t('eval_subtitle')}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-blue-800 mb-3">{t('eval_about')}</h2>
          <p className="text-blue-700 text-sm mb-4">
            {t('eval_about_text')}
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>{t('eval_items')}</li>
            <li>{t('eval_items_cbi')}</li>
            <li>{t('eval_items_qual')}</li>
            <li>{t('eval_time')}</li>
            <li>{t('eval_confidential')}</li>
          </ul>
        </div>
        <button onClick={() => setPaso('consentimiento')}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
          {t('eval_start')} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // ── CONSENTIMIENTO INFORMADO ─────────────────────────────
  if (paso === 'consentimiento') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('consent_title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('consent_step')}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 h-80 overflow-y-auto text-sm text-gray-700 space-y-4 leading-relaxed">
          <p className="font-semibold text-gray-800">Estudio: BurnoutCare — Detección de Burnout Laboral mediante IA</p>

          <div>
            <p className="font-semibold mb-1">Investigador principal</p>
            <p>Rubén Beltrán Marañón — Instituto Tecnológico de Orizaba (TecNM) / ReSTORE Lab, Universidad de Toronto. Directora: Dra. Edna Araceli Romero Flores.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Propósito del estudio</p>
            <p>Este estudio tiene como objetivo desarrollar y validar un sistema de soporte a la decisión clínica para la detección temprana de burnout ocupacional. Tu participación contribuye directamente a mejorar la salud laboral en organizaciones.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">¿Qué implica tu participación?</p>
            <p>Responder el Copenhagen Burnout Inventory (CBI) de 19 preguntas en escala Likert, un perfil demográfico breve y tres preguntas cualitativas opcionales. Tiempo estimado: 10–15 minutos.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Confidencialidad y manejo de datos</p>
            <p>Tus respuestas se almacenarán en una base de datos segura. Para fines de investigación y publicación, los datos se utilizan de forma agregada y anonimizada — nunca se publicarán datos individuales que permitan identificarte. El acceso a los datos crudos está restringido al equipo de investigación.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Participación voluntaria</p>
            <p>Tu participación es completamente voluntaria. Puedes abandonar el cuestionario en cualquier momento sin ninguna consecuencia. Si ya enviaste tus respuestas y deseas que sean eliminadas, contáctanos y las removeremos del dataset.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Riesgos y beneficios</p>
            <p>No existen riesgos significativos asociados a este estudio. Como beneficio, recibirás un análisis personalizado de tu nivel de burnout con recomendaciones específicas generadas por IA.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Contacto</p>
            <p>¿Tienes preguntas sobre el estudio? Escríbenos a: <span className="font-medium">burnoutcare.research@gmail.com</span></p>
          </div>

          <p className="text-xs text-gray-400 pt-2">Versión del formulario: {CONSENTIMIENTO_VERSION}</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 border-2 rounded-lg transition-colors"
          style={{ borderColor: consentimientoAceptado ? '#2563EB' : '#D1D5DB', backgroundColor: consentimientoAceptado ? '#EFF6FF' : 'white' }}>
          <input
            type="checkbox"
            className="mt-0.5 w-5 h-5 accent-blue-600 flex-shrink-0"
            checked={consentimientoAceptado}
            onChange={e => {
              setConsentimientoAceptado(e.target.checked);
              if (e.target.checked) setConsentimientoFecha(new Date().toISOString());
              else setConsentimientoFecha(null);
            }}
          />
          <span className="text-sm text-gray-700">
            {t('consent_accept')}
          </span>
        </label>

        <div className="flex gap-3">
          <button onClick={() => setPaso('inicio')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" /> {t('back')}
          </button>
          <button
            onClick={() => consentimientoAceptado && setPaso('datos')}
            disabled={!consentimientoAceptado}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors
              ${consentimientoAceptado
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {t('consent_continue')} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── YA COMPLETADO (duplicado) ────────────────────────────
  if (paso === 'ya-completado') {
    const fechaFormateada = evaluacionExistente?.ultima_fecha
      ? new Date(evaluacionExistente.ultima_fecha).toLocaleDateString('es-MX', {
          day: '2-digit', month: 'long', year: 'numeric'
        })
      : 'fecha desconocida';
    const diasRestantes = evaluacionExistente?.ultima_fecha
      ? 30 - Math.floor((Date.now() - new Date(evaluacionExistente.ultima_fecha)) / 86400000)
      : 30;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('eval_already_done_title')}</h2>
          <p className="text-gray-600 mb-6">
            {t('eval_already_done_desc')} <span className="font-semibold">{fechaFormateada}</span>.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
            Podrás realizar una nueva evaluación en aproximadamente{' '}
            <span className="font-semibold">{diasRestantes} día{diasRestantes !== 1 ? 's' : ''}</span>.
          </div>

          <div className="flex flex-col gap-3">
            {evaluacionExistente?.evaluacion_id && onCambiarModulo && (
              <button
                onClick={() => onCambiarModulo('recomendaciones')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <ClipboardList className="w-5 h-5" /> Ver mis recomendaciones
              </button>
            )}
            <button
              onClick={reiniciarEvaluacion}
              className="w-full py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
            >
              {t('back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DATOS BÁSICOS ────────────────────────────────────────
  if (paso === 'datos') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('collaborator_title')}</h2>
        <p className="text-gray-500 text-sm mb-6">{t('collaborator_step')}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" /> {t('collaborator_name')}
            </label>
            <input type="text" value={datosColaborador.nombre}
              onChange={e => setDatosColaborador({ ...datosColaborador, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('collaborator_name_placeholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building className="w-4 h-4 inline mr-1" /> {t('collaborator_area')}
            </label>
            <input type="text" value={datosColaborador.area}
              onChange={e => setDatosColaborador({ ...datosColaborador, area: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('collaborator_area_placeholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Briefcase className="w-4 h-4 inline mr-1" /> {t('collaborator_position')}
            </label>
            <input type="text" value={datosColaborador.puesto}
              onChange={e => setDatosColaborador({ ...datosColaborador, puesto: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('collaborator_position_placeholder')} />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={() => setPaso('inicio')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" /> {t('back')}
          </button>
          <button onClick={() => setPaso('demograficos')} disabled={!datosColaborador.nombre}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {t('collaborator_continue')} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── SECCIÓN 1: DEMOGRÁFICOS ──────────────────────────────
  if (paso === 'demograficos') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{t('demo_title')}</h2>
        <p className="text-gray-500 text-sm mb-2">{t('demo_step')}</p>
        <p className="text-gray-500 text-sm mb-6">
          {t('demo_instructions')}
        </p>
        <div className="space-y-4">
          <SelectField label={t('demo_age')} value={demograficos.edad}
            onChange={v => setDemograficos({ ...demograficos, edad: v })} options={opcionesEdad} />
          <SelectField label={t('demo_gender')} value={demograficos.genero}
            onChange={v => setDemograficos({ ...demograficos, genero: v })} options={opcionesGenero} />
          <SelectField label={t('demo_education')} value={demograficos.educacion}
            onChange={v => setDemograficos({ ...demograficos, educacion: v })} options={opcionesEducacion} />
          <SelectField label={t('demo_sector')} value={demograficos.sector}
            onChange={v => setDemograficos({ ...demograficos, sector: v })} options={opcionesSector} />
          <SelectField label={t('demo_industry')} value={demograficos.industria}
            onChange={v => setDemograficos({ ...demograficos, industria: v })} options={opcionesIndustria} />
          {demograficos.industria === t('industry_other') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('demo_industry_other')}</label>
              <input type="text" value={demograficos.industria_otro}
                onChange={e => setDemograficos({ ...demograficos, industria_otro: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('demo_industry_other')} />
            </div>
          )}
          <SelectField label={t('demo_job_level')} value={demograficos.nivel_puesto}
            onChange={v => setDemograficos({ ...demograficos, nivel_puesto: v })} options={opcionesPuesto} />
          <SelectField label={t('demo_experience')} value={demograficos.experiencia}
            onChange={v => setDemograficos({ ...demograficos, experiencia: v })} options={opcionesExperiencia} />
          <SelectField label={t('demo_hours')} value={demograficos.horas_semanales}
            onChange={v => setDemograficos({ ...demograficos, horas_semanales: v })} options={opcionesHoras} />
          <SelectField label={t('demo_work_mode')} value={demograficos.modalidad}
            onChange={v => setDemograficos({ ...demograficos, modalidad: v })} options={opcionesModalidad} />
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={() => setPaso('datos')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" /> {t('back')}
          </button>
          <button onClick={() => setPaso('evaluacion')} disabled={!demograficosCompletos()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {t('next')} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── SECCIÓN 2: CBI ───────────────────────────────────────
  if (paso === 'evaluacion') {
    const pregunta = preguntasCBI[preguntaActual];
    const progreso = ((preguntaActual + 1) / preguntasCBI.length) * 100;
    const dimensionTexto = {
      BP: t('dim_personal'),
      BL: t('dim_work'),
      BC: t('dim_client'),
    };
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-gray-500 text-sm mb-4">{t('eval_subtitle')} — {t('demo_step').replace('2', '3')}</p>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t('eval_question')} {preguntaActual + 1} {t('eval_of')} {preguntasCBI.length}</span>
              <span>{Math.round(progreso)}% {t('eval_completed')}</span>
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
              <ChevronLeft className="w-5 h-5" /> {t('previous')}
            </button>
            {preguntaActual === preguntasCBI.length - 1 && respuestas[pregunta.id] !== undefined && (
              <button onClick={() => setPaso('cualitativos')}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                {t('next')} <ChevronRight className="w-5 h-5" />
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
        <h2 className="text-xl font-bold text-gray-800 mb-1">{t('qual_title')}</h2>
        <p className="text-gray-500 text-sm mb-2">{t('qual_step')}</p>
        <p className="text-gray-500 text-sm mb-6">
          {t('qual_instructions')}
        </p>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('qual_q1_label')}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {t('qual_q1_desc')}
            </p>
            <textarea value={cualitativos.factores_ambiente}
              onChange={e => setCualitativos({ ...cualitativos, factores_ambiente: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={t('qual_placeholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('qual_q2_label')}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {t('qual_q2_desc')}
            </p>
            <textarea value={cualitativos.soporte_organizacional}
              onChange={e => setCualitativos({ ...cualitativos, soporte_organizacional: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={t('qual_placeholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('qual_q3_label')}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {t('qual_q3_desc')}
            </p>
            <textarea value={cualitativos.comentarios}
              onChange={e => setCualitativos({ ...cualitativos, comentarios: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={t('qual_placeholder')} />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={() => setPaso('evaluacion')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
            <ChevronLeft className="w-5 h-5" /> {t('back')}
          </button>
          <button onClick={finalizarEvaluacion} disabled={guardando}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {guardando ? t('eval_saving') : t('qual_finish')}
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('result_subtitle')}</h1>
            <p className="text-gray-600">{t('eval_subtitle')}</p>
          </div>
          <div className={`p-6 rounded-lg mb-6 bg-${colorGeneral}-50 border border-${colorGeneral}-200`}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('risk_general')}</h2>
            <p className={`text-3xl font-bold text-${colorGeneral}-600`}>{riskLabel[nivelGeneral]}</p>
          </div>
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-800">{t('rec_dimensions')}</h3>
            <div className="grid gap-4">
              {[
                { key: 'BP', label: t('dim_personal'), desc: t('dim_personal_desc') },
                { key: 'BL', label: t('dim_work'),     desc: t('dim_work_desc') },
                { key: 'BC', label: t('dim_client'),   desc: t('dim_client_desc') },
              ].map(({ key, label, desc }) => (
                <div key={key} className={`p-4 rounded-lg ${niveles[key].bg}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{label}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${niveles[key].color}`}>{puntajes[key]}</p>
                      <p className={`text-sm font-medium ${niveles[key].color}`}>{riskLabel[niveles[key].nivel]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">{t('scale_reference')}</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-green-100 rounded"><p className="font-medium text-green-700">0-49</p><p className="text-green-600">{t('risk_low')}</p></div>
              <div className="text-center p-2 bg-yellow-100 rounded"><p className="font-medium text-yellow-700">50-74</p><p className="text-yellow-600">{t('risk_medium')}</p></div>
              <div className="text-center p-2 bg-red-100 rounded"><p className="font-medium text-red-700">75-100</p><p className="text-red-600">{t('risk_high')}</p></div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={reiniciarEvaluacion}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              {t('eval_new')}
            </button>
            <button onClick={() => onCambiarModulo('mis-recomendaciones')}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {t('result_view_recommendations')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ModuloEvaluacionMBI;
