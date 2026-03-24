import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // General
      app_name: 'BurnoutCare',
      app_subtitle: 'Sistema de Detección y Apoyo',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      update: 'Actualizar',
      close: 'Cerrar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      yes: 'Sí',
      no: 'No',
      
      // Login
      login_title: 'Iniciar Sesión',
      login_subtitle: 'Ingresa tus credenciales',
      login_email: 'Correo electrónico',
      login_password: 'Contraseña',
      login_button: 'Ingresar',
      login_loading: 'Ingresando...',
      login_error: 'Credenciales incorrectas',
      login_access: 'Acceder al Sistema',
      logout: 'Cerrar Sesión',
      test_user: 'Usuario de prueba',
      
      // Menú
      menu_evaluation: 'Evaluación CBI',
      menu_alerts: 'Dashboard Alertas',
      menu_cases: 'Detalle de Casos',
      menu_followup: 'Seguimiento Clínico',
      menu_indicators: 'Indicadores',
      menu_reports: 'Reportes NOM-035',
      menu_users: 'Gestión Usuarios',
      menu_roles: 'Roles y Permisos',
      menu_audit: 'Auditoría',
      menu_recommendations: 'Recomendaciones IA',
      
      // Evaluación CBI
      eval_title: 'Evaluación de Burnout',
      eval_subtitle: 'Copenhagen Burnout Inventory (CBI)',
      eval_about: 'Acerca del CBI',
      eval_about_text: 'El Copenhagen Burnout Inventory es un instrumento validado científicamente que evalúa tres dimensiones del burnout: personal, laboral y relacionado con clientes/usuarios.',
      eval_questions: '19 preguntas en total',
      eval_time: 'Tiempo estimado: 5-10 minutos',
      eval_results: 'Resultados inmediatos',
      eval_confidential: 'Completamente confidencial',
      eval_start: 'Comenzar Evaluación',
      eval_finish: 'Finalizar',
      eval_new: 'Nueva Evaluación',
      eval_question: 'Pregunta',
      eval_of: 'de',
      eval_completed: 'completado',
      
      // Dimensiones CBI
      dim_personal: 'Burnout Personal',
      dim_personal_desc: 'Agotamiento físico y psicológico general',
      dim_work: 'Burnout Laboral',
      dim_work_desc: 'Agotamiento relacionado con el trabajo',
      dim_client: 'Burnout por Cliente',
      dim_client_desc: 'Agotamiento en el trato con clientes/usuarios',
      
      // Niveles de riesgo
      risk_level: 'Nivel de Riesgo',
      risk_high: 'Alto',
      risk_medium: 'Medio',
      risk_low: 'Bajo',
      risk_general: 'Nivel de Riesgo General',
      
      // Opciones de respuesta CBI
      answer_never: 'Nunca / Casi nunca',
      answer_rarely: 'Rara vez',
      answer_sometimes: 'A veces',
      answer_often: 'Frecuentemente',
      answer_always: 'Siempre',
      
      // Dashboard
      dashboard_title: 'Dashboard de Alertas',
      dashboard_subtitle: 'Monitoreo de casos por nivel de riesgo',
      total_evaluations: 'Total Evaluaciones',
      
      // Usuarios
      users_title: 'Gestión de Usuarios',
      users_subtitle: 'Administración de usuarios del sistema BurnoutCare',
      users_new: 'Nuevo Usuario',
      users_edit: 'Editar Usuario',
      users_name: 'Nombre completo',
      users_email: 'Email',
      users_role: 'Rol',
      users_area: 'Área',
      users_position: 'Puesto',
      users_status: 'Estado',
      users_active: 'Activo',
      users_inactive: 'Inactivo',
      users_actions: 'Acciones',
      
      // Roles
      role_admin: 'Administrador',
      role_professional: 'Profesional',
      role_coordinator: 'Coordinador',
      role_evaluated: 'Evaluado',
      
      // Auditoría
      audit_title: 'Auditoría de Seguridad',
      audit_subtitle: 'Registro de todas las actividades del sistema BurnoutCare',
      audit_total: 'Total Registros',
      audit_creates: 'Creaciones',
      audit_updates: 'Actualizaciones',
      audit_deletes: 'Eliminaciones',
      audit_date: 'Fecha/Hora',
      audit_user: 'Usuario',
      audit_action: 'Acción',
      audit_module: 'Módulo',
      audit_details: 'Detalles',
      
      // Acciones
      action_create: 'Crear',
      action_update: 'Actualizar',
      action_delete: 'Eliminar',
      action_login: 'Inicio sesión',
      action_logout: 'Cierre sesión',
      
      // Recomendaciones
      rec_title: 'Motor de Recomendaciones IA',
      rec_subtitle: 'Genera recomendaciones personalizadas usando inteligencia artificial',
      rec_generate: 'Generar Recomendación',
      rec_generating: 'Generando...',
      rec_urgency: 'Nivel de Urgencia',
      rec_analysis: 'Análisis General',
      rec_dimensions: 'Análisis por Dimensión',
      rec_immediate: 'Recomendaciones Inmediatas',
      rec_medium: 'Recomendaciones a Mediano Plazo',
      rec_selfcare: 'Técnicas de Autocuidado',
      rec_followup: 'Plan de Seguimiento',
      rec_ai: 'Generado por IA',
      rec_rules: 'Basado en reglas',
      
      // Reportes
      reports_title: 'Reportes NOM-035',
      reports_subtitle: 'Generación de reportes de cumplimiento normativo con CBI',
      reports_generate: 'Generar Reporte',
      reports_download: 'Descargar',
      reports_preview: 'Vista Previa del Reporte',
      reports_type: 'Tipo de reporte',
      reports_general: 'Reporte General',
      reports_executive: 'Resumen Ejecutivo',
      reports_detailed: 'Reporte Detallado',
      
      // Datos del colaborador
      collaborator_data: 'Datos del Colaborador',
      collaborator_name: 'Nombre completo',
      collaborator_area: 'Área / Departamento',
      collaborator_position: 'Puesto',
      
      // Indicadores
      indicators_title: 'Panel de Indicadores Institucionales',
      indicators_subtitle: 'Métricas y estadísticas del Copenhagen Burnout Inventory (CBI)',
      indicators_distribution: 'Distribución por Nivel de Riesgo',
      indicators_averages: 'Promedios Institucionales CBI',
      indicators_by_area: 'Indicadores por Área',
      
      // Seguimiento
      followup_title: 'Seguimiento Clínico',
      followup_subtitle: 'Gestión de intervenciones para casos de riesgo medio y alto',
      followup_cases: 'Casos en Seguimiento',
      followup_interventions: 'Intervenciones',
      followup_new: 'Nueva Intervención',
      followup_type: 'Tipo de intervención',
      followup_scheduled: 'Fecha programada',
      followup_description: 'Descripción / Notas',
      followup_status: 'Estado',
      followup_pending: 'Pendiente',
      followup_in_progress: 'En progreso',
      followup_completed: 'Completada',
      followup_cancelled: 'Cancelada',
      
      // Mensajes
      msg_no_data: 'No hay datos disponibles',
      msg_no_evaluations: 'No hay evaluaciones registradas',
      msg_no_users: 'No hay usuarios que mostrar',
      msg_select_evaluation: 'Selecciona una evaluación',
      msg_connection_error: 'Error de conexión con el servidor',
      msg_save_success: 'Guardado exitosamente',
      msg_delete_confirm: '¿Estás seguro de eliminar?',
      
      // Escala de referencia
      scale_reference: 'Escala de referencia CBI (0-100)',
      scale_low: '0-49: Bajo',
      scale_medium: '50-74: Medio',
      scale_high: '75-100: Alto',
// Demográficos
demo_title: 'Sección 1: Perfil Demográfico y Ocupacional',
demo_step: 'Paso 2 de 4',
demo_instructions: 'Esta información es anónima y se usa para identificar patrones organizacionales.',
demo_age: '1. Rango de edad',
demo_gender: '2. Género',
demo_education: '3. Nivel educativo más alto',
demo_sector: '4. Sector de trabajo',
demo_industry: '5. Industria / Campo',
demo_industry_other: 'Especifica tu industria',
demo_job_level: '6. Nivel de puesto',
demo_experience: '7. Años de experiencia en posición actual',
demo_hours: '8. Horas de trabajo promedio por semana',
demo_work_mode: '9. Modalidad de trabajo',
demo_select: 'Selecciona una opción...',

// Opciones demográficas
age_18: '18-25', age_26: '26-35', age_36: '36-45', age_46: '46-55', age_56: '56+',
gender_male: 'Masculino', gender_female: 'Femenino', gender_nb: 'No binario', gender_na: 'Prefiero no decir',
edu_hs: 'Preparatoria / Bachillerato', edu_tech: 'Técnico', edu_bach: 'Licenciatura', edu_master: 'Maestría', edu_phd: 'Doctorado',
sector_private: 'Sector privado', sector_public: 'Sector público', sector_ngo: 'ONG / Sin fines de lucro',
industry_mfg: 'Manufactura', industry_health: 'Salud', industry_edu: 'Educación', industry_eng: 'Construcción / Ingeniería', industry_svc: 'Servicios', industry_other: 'Otro',
level_entry: 'Operativo / Entrada', level_staff: 'Especialista / Staff', level_mid: 'Mandos medios', level_exec: 'Dirección / Liderazgo',
exp_less1: 'Menos de 1 año', exp_1_3: '1-3 años', exp_4_7: '4-7 años', exp_8plus: '8+ años',
hours_less40: 'Menos de 40h', hours_40_48: '40-48h', hours_more48: 'Más de 48h',
mode_onsite: 'Presencial', mode_remote: 'Remoto / Teletrabajo', mode_hybrid: 'Híbrido',

// Cualitativos
qual_title: 'Sección 3: Contexto Cualitativo',
qual_step: 'Paso 4 de 4 — Opcional',
qual_instructions: 'Tus respuestas ayudan al equipo a entender los factores organizacionales detrás de los datos.',
qual_q1_label: '1. Factores del ambiente de trabajo',
qual_q1_desc: '¿Cuáles son los principales factores en tu entorno laboral (carga de trabajo, liderazgo, recursos) que más contribuyen a tu estrés o bienestar?',
qual_q2_label: '2. Soporte organizacional',
qual_q2_desc: '¿Qué cambios, herramientas o sistemas de apoyo crees que tu organización podría implementar para prevenir mejor el burnout?',
qual_q3_label: '3. Comentarios adicionales',
qual_q3_desc: '¿Hay algo más que quieras compartir sobre tu experiencia con el estrés laboral que no fue cubierto en las preguntas anteriores?',
qual_placeholder: 'Escribe tu respuesta aquí (opcional)...',
qual_finish: 'Finalizar Evaluación',
    }
  },
  en: {
    translation: {
      // General
      app_name: 'BurnoutCare',
      app_subtitle: 'Detection and Support System',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      update: 'Update',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      
      // Login
      login_title: 'Sign In',
      login_subtitle: 'Enter your credentials',
      login_email: 'Email address',
      login_password: 'Password',
      login_button: 'Sign In',
      login_loading: 'Signing in...',
      login_error: 'Invalid credentials',
      login_access: 'Access System',
      logout: 'Sign Out',
      test_user: 'Test user',
      
      // Menu
      menu_evaluation: 'CBI Evaluation',
      menu_alerts: 'Alerts Dashboard',
      menu_cases: 'Case Details',
      menu_followup: 'Clinical Follow-up',
      menu_indicators: 'Indicators',
      menu_reports: 'NOM-035 Reports',
      menu_users: 'User Management',
      menu_roles: 'Roles & Permissions',
      menu_audit: 'Audit',
      menu_recommendations: 'AI Recommendations',
      
      // CBI Evaluation
      eval_title: 'Burnout Evaluation',
      eval_subtitle: 'Copenhagen Burnout Inventory (CBI)',
      eval_about: 'About CBI',
      eval_about_text: 'The Copenhagen Burnout Inventory is a scientifically validated instrument that assesses three dimensions of burnout: personal, work-related, and client-related.',
      eval_questions: '19 questions in total',
      eval_time: 'Estimated time: 5-10 minutes',
      eval_results: 'Immediate results',
      eval_confidential: 'Completely confidential',
      eval_start: 'Start Evaluation',
      eval_finish: 'Finish',
      eval_new: 'New Evaluation',
      eval_question: 'Question',
      eval_of: 'of',
      eval_completed: 'completed',
      
      // CBI Dimensions
      dim_personal: 'Personal Burnout',
      dim_personal_desc: 'General physical and psychological exhaustion',
      dim_work: 'Work-related Burnout',
      dim_work_desc: 'Exhaustion related to work',
      dim_client: 'Client-related Burnout',
      dim_client_desc: 'Exhaustion in dealing with clients/users',
      
      // Risk levels
      risk_level: 'Risk Level',
      risk_high: 'High',
      risk_medium: 'Medium',
      risk_low: 'Low',
      risk_general: 'General Risk Level',
      
      // CBI response options
      answer_never: 'Never / Almost never',
      answer_rarely: 'Rarely',
      answer_sometimes: 'Sometimes',
      answer_often: 'Often',
      answer_always: 'Always',
      
      // Dashboard
      dashboard_title: 'Alerts Dashboard',
      dashboard_subtitle: 'Case monitoring by risk level',
      total_evaluations: 'Total Evaluations',
      
      // Users
      users_title: 'User Management',
      users_subtitle: 'BurnoutCare system user administration',
      users_new: 'New User',
      users_edit: 'Edit User',
      users_name: 'Full name',
      users_email: 'Email',
      users_role: 'Role',
      users_area: 'Area',
      users_position: 'Position',
      users_status: 'Status',
      users_active: 'Active',
      users_inactive: 'Inactive',
      users_actions: 'Actions',
      
      // Roles
      role_admin: 'Administrator',
      role_professional: 'Professional',
      role_coordinator: 'Coordinator',
      role_evaluated: 'Evaluated',
      
      // Audit
      audit_title: 'Security Audit',
      audit_subtitle: 'Record of all BurnoutCare system activities',
      audit_total: 'Total Records',
      audit_creates: 'Creations',
      audit_updates: 'Updates',
      audit_deletes: 'Deletions',
      audit_date: 'Date/Time',
      audit_user: 'User',
      audit_action: 'Action',
      audit_module: 'Module',
      audit_details: 'Details',
      
      // Actions
      action_create: 'Create',
      action_update: 'Update',
      action_delete: 'Delete',
      action_login: 'Login',
      action_logout: 'Logout',
      
      // Recommendations
      rec_title: 'AI Recommendations Engine',
      rec_subtitle: 'Generate personalized recommendations using artificial intelligence',
      rec_generate: 'Generate Recommendation',
      rec_generating: 'Generating...',
      rec_urgency: 'Urgency Level',
      rec_analysis: 'General Analysis',
      rec_dimensions: 'Analysis by Dimension',
      rec_immediate: 'Immediate Recommendations',
      rec_medium: 'Medium-term Recommendations',
      rec_selfcare: 'Self-care Techniques',
      rec_followup: 'Follow-up Plan',
      rec_ai: 'AI Generated',
      rec_rules: 'Rule-based',
      
      // Reports
      reports_title: 'NOM-035 Reports',
      reports_subtitle: 'Regulatory compliance report generation with CBI',
      reports_generate: 'Generate Report',
      reports_download: 'Download',
      reports_preview: 'Report Preview',
      reports_type: 'Report type',
      reports_general: 'General Report',
      reports_executive: 'Executive Summary',
      reports_detailed: 'Detailed Report',
      
      // Collaborator data
      collaborator_data: 'Collaborator Data',
      collaborator_name: 'Full name',
      collaborator_area: 'Area / Department',
      collaborator_position: 'Position',
      
      // Indicators
      indicators_title: 'Institutional Indicators Panel',
      indicators_subtitle: 'Copenhagen Burnout Inventory (CBI) metrics and statistics',
      indicators_distribution: 'Distribution by Risk Level',
      indicators_averages: 'CBI Institutional Averages',
      indicators_by_area: 'Indicators by Area',
      
      // Follow-up
      followup_title: 'Clinical Follow-up',
      followup_subtitle: 'Intervention management for medium and high risk cases',
      followup_cases: 'Cases in Follow-up',
      followup_interventions: 'Interventions',
      followup_new: 'New Intervention',
      followup_type: 'Intervention type',
      followup_scheduled: 'Scheduled date',
      followup_description: 'Description / Notes',
      followup_status: 'Status',
      followup_pending: 'Pending',
      followup_in_progress: 'In progress',
      followup_completed: 'Completed',
      followup_cancelled: 'Cancelled',
      
      // Messages
      msg_no_data: 'No data available',
      msg_no_evaluations: 'No evaluations registered',
      msg_no_users: 'No users to display',
      msg_select_evaluation: 'Select an evaluation',
      msg_connection_error: 'Server connection error',
      msg_save_success: 'Saved successfully',
      msg_delete_confirm: 'Are you sure you want to delete?',
      
      // Reference scale
      scale_reference: 'CBI reference scale (0-100)',
      scale_low: '0-49: Low',
      scale_medium: '50-74: Medium',
      scale_high: '75-100: High',
// Demographics
demo_title: 'Section 1: Demographic and Occupational Profile',
demo_step: 'Step 2 of 4',
demo_instructions: 'This information is anonymous and used to identify organizational patterns.',
demo_age: '1. Age Range',
demo_gender: '2. Gender',
demo_education: '3. Highest Level of Education',
demo_sector: '4. Work Sector',
demo_industry: '5. Industry / Field',
demo_industry_other: 'Specify your industry',
demo_job_level: '6. Job Level',
demo_experience: '7. Years of Experience in Current Position',
demo_hours: '8. Average Weekly Working Hours',
demo_work_mode: '9. Work Arrangement',
demo_select: 'Select an option...',

// Demographic options
age_18: '18-25', age_26: '26-35', age_36: '36-45', age_46: '46-55', age_56: '56+',
gender_male: 'Male', gender_female: 'Female', gender_nb: 'Non-binary', gender_na: 'Prefer not to say',
edu_hs: 'High School', edu_tech: 'Technical Degree', edu_bach: "Bachelor's Degree", edu_master: "Master's Degree", edu_phd: 'PhD',
sector_private: 'Private Sector', sector_public: 'Public Sector', sector_ngo: 'Non-profit / NGO',
industry_mfg: 'Manufacturing', industry_health: 'Healthcare', industry_edu: 'Education', industry_eng: 'Construction/Engineering', industry_svc: 'Services', industry_other: 'Other',
level_entry: 'Entry-level', level_staff: 'Specialist/Staff', level_mid: 'Middle Management', level_exec: 'Senior Leadership/Executive',
exp_less1: 'Less than 1 year', exp_1_3: '1-3 years', exp_4_7: '4-7 years', exp_8plus: '8+ years',
hours_less40: 'Less than 40h', hours_40_48: '40-48h', hours_more48: 'More than 48h',
mode_onsite: 'On-site', mode_remote: 'Remote/Telework', mode_hybrid: 'Hybrid',

// Qualitative
qual_title: 'Section 3: Qualitative Context',
qual_step: 'Step 4 of 4 — Optional',
qual_instructions: 'Your answers help the research team understand the organizational factors behind the data.',
qual_q1_label: '1. Work Environment Factors',
qual_q1_desc: 'In your own words, what are the primary factors in your current work environment (e.g., workload, leadership, resources) that contribute most to your stress or well-being?',
qual_q2_label: '2. Organizational Support',
qual_q2_desc: 'Are there any specific changes, tools, or support systems that you believe your organization could implement to better prevent burnout?',
qual_q3_label: '3. Additional Comments',
qual_q3_desc: 'Is there anything else you would like to share regarding your experience with workplace stress that was not covered in the previous questions?',
qual_placeholder: 'Write your answer here (optional)...',
qual_finish: 'Finish Evaluation',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;