import React, { useState } from 'react';
import api from '../services/api';

const RegistroEvaluado = ({ onRegistroExitoso, onVolverLogin }) => {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    codigo_registro: '',
    nombre: '',
    email: '',
    password: '',
    confirmar_password: '',
    area: '',
    puesto: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validarPaso1 = () => {
    if (!form.codigo_registro.trim()) {
      setError('Ingresa el código de tu empresa');
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    if (!form.nombre.trim()) { setError('Ingresa tu nombre'); return false; }
    if (!form.email.trim()) { setError('Ingresa tu email'); return false; }
    if (!form.password) { setError('Ingresa una contraseña'); return false; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return false; }
    if (form.password !== form.confirmar_password) { setError('Las contraseñas no coinciden'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarPaso2()) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/registro-evaluado', {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        codigo_registro: form.codigo_registro,
        area: form.area,
        puesto: form.puesto
      });

      if (response.data.success) {
        onRegistroExitoso(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🧠</div>
          <h1 className="text-2xl font-bold text-gray-800">BurnoutCare</h1>
          <p className="text-gray-500 text-sm mt-1">Crear cuenta de colaborador</p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`h-1 w-16 ${paso >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Paso 1: Código de empresa */}
        {paso === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Código de tu empresa</h2>
            <p className="text-gray-500 text-sm mb-4">Solicita este código al área de Recursos Humanos de tu empresa.</p>
            <input
              type="text"
              name="codigo_registro"
              value={form.codigo_registro}
              onChange={handleChange}
              placeholder="Ej: CONS-2026"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-indigo-500 uppercase"
              onKeyUp={(e) => { setForm({ ...form, codigo_registro: e.target.value.toUpperCase() }); }}
            />
            <button
              onClick={() => { if (validarPaso1()) setPaso(2); }}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Paso 2: Datos personales */}
        {paso === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Tus datos personales</h2>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña (mínimo 6 caracteres)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              name="confirmar_password"
              value={form.confirmar_password}
              onChange={handleChange}
              placeholder="Confirmar contraseña"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="Área o departamento (opcional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              name="puesto"
              value={form.puesto}
              onChange={handleChange}
              placeholder="Puesto de trabajo (opcional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPaso(1)}
                className="w-1/3 border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
              >
                ← Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>
          </div>
        )}

        {/* Link a login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onVolverLogin} className="text-indigo-600 hover:underline font-medium">
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistroEvaluado;