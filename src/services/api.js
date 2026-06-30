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
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
      const err = new Error(data.error || 'Error en la petición');
      err.status = response.status;
      err.codigo = data.codigo || null;
      err.data = data;
      throw err;
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
  }),
  exportarCSV: async (empresaId = null) => {
    const query = empresaId ? `?empresa_id=${empresaId}` : '';
    const response = await fetch(`${API_URL}/evaluaciones/export-csv${query}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error('Error al exportar CSV');
    const blob = await response.blob();
    const fecha = new Date().toISOString().split('T')[0];
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burnoutcare_datos_${fecha}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
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
