// Configuración base de la API
const API_URL = 'https://burnoutcare-api-production.up.railway.app/api';

// Obtener token del localStorage
const getToken = () => localStorage.getItem('token');

// Headers con autenticación
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Función genérica para peticiones
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('Error API:', error);
    throw error;
  }
};

// ==================== AUTH ====================
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
    }
    return data;
  },
  
  registro: async (userData) => {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },
  
  getUsuarioActual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },
  
  estaAutenticado: () => {
    return !!localStorage.getItem('token');
  }
};

// ==================== EMPRESAS ====================
export const empresasService = {
  obtenerTodas: () => fetchAPI('/empresas'),
  obtenerPorId: (id) => fetchAPI(`/empresas/${id}`),
  crear: (data) => fetchAPI('/empresas', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  actualizar: (id, data) => fetchAPI(`/empresas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
 eliminar: (id) => fetchAPI(`/empresas/${id}`, {
    method: 'DELETE'
  }),
  toggleActivo: (id) => fetchAPI(`/empresas/${id}/toggle`, { method: 'PATCH' }),
  obtenerUsuarios: (id) => fetchAPI(`/empresas/${id}/usuarios`)
};

// ==================== USUARIOS ====================
export const usuariosService = {
  obtenerTodos: (empresaId = null) => {
    const query = empresaId ? `?empresa_id=${empresaId}` : '';
    return fetchAPI(`/usuarios${query}`);
  },
  obtenerPorId: (id) => fetchAPI(`/usuarios/${id}`),
  crear: (data) => fetchAPI('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  actualizar: (id, data) => fetchAPI(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  eliminar: (id) => fetchAPI(`/usuarios/${id}`, {
    method: 'DELETE'
  })
};

// ==================== EVALUACIONES ====================
export const evaluacionesService = {
  obtenerTodas: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const query = params ? `?${params}` : '';
    return fetchAPI(`/evaluaciones${query}`);
  },
  obtenerPorId: (id) => fetchAPI(`/evaluaciones/${id}`),
  crear: (data) => fetchAPI('/evaluaciones', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  obtenerEstadisticas: (empresaId = null) => {
    const query = empresaId ? `?empresa_id=${empresaId}` : '';
    return fetchAPI(`/evaluaciones/estadisticas${query}`);
  },
  eliminar: (id) => fetchAPI(`/evaluaciones/${id}`, {
    method: 'DELETE'
  })
};

// ==================== RECOMENDACIONES ====================
export const recomendacionesService = {
  generar: (evaluacionId) => fetchAPI('/recomendaciones/generar', {
    method: 'POST',
    body: JSON.stringify({ evaluacion_id: evaluacionId })
  }),
  obtenerPorEvaluacion: (evaluacionId) => fetchAPI(`/recomendaciones/${evaluacionId}`),
  obtenerTodas: () => fetchAPI('/recomendaciones')
};
// ==================== AUDITORÍA ====================
export const auditoriaService = {
  obtenerTodos: () => fetchAPI('/auditoria')
};
export default {
  auth: authService,
  empresas: empresasService,
  usuarios: usuariosService,
  evaluaciones: evaluacionesService,
  recomendaciones: recomendacionesService
};
