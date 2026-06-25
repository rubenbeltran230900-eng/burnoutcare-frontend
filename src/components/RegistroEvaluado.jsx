import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RegistroEvaluado = ({ onRegistroExitoso, onVolverLogin }) => {
  const { t } = useTranslation();
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
      setError(t('reg_err_code'));
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    if (!form.nombre.trim()) { setError(t('reg_err_name')); return false; }
    if (!form.email.trim()) { setError(t('reg_err_email')); return false; }
    if (!form.password) { setError(t('reg_err_password')); return false; }
    if (form.password.length < 6) { setError(t('reg_err_password_min')); return false; }
    if (form.password !== form.confirmar_password) { setError(t('reg_err_password_match')); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarPaso2()) return;
    setLoading(true);
    try {
      const response = await fetch('https://burnoutcare-api-production.up.railway.app/api/auth/registro-evaluado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          codigo_registro: form.codigo_registro,
          area: form.area,
          puesto: form.puesto
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        onRegistroExitoso(data.data);
      } else {
        setError(data.error || t('reg_err_register'));
      }
    } catch (err) {
      setError(t('reg_err_server'));
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
          <h1 className="text-2xl font-bold text-gray-800">{t('app_name')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('reg_subtitle')}</p>
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('reg_step1_title')}</h2>
            <p className="text-gray-500 text-sm mb-4">{t('reg_step1_desc')}</p>
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
              {t('reg_continue')}
            </button>
          </div>
        )}

        {/* Paso 2: Datos personales */}
        {paso === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('reg_step2_title')}</h2>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder={t('reg_placeholder_name')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('reg_placeholder_email')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t('reg_placeholder_password')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              name="confirmar_password"
              value={form.confirmar_password}
              onChange={handleChange}
              placeholder={t('reg_placeholder_confirm')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder={t('reg_placeholder_area')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              name="puesto"
              value={form.puesto}
              onChange={handleChange}
              placeholder={t('reg_placeholder_position')}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPaso(1)}
                className="w-1/3 border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
              >
                {t('reg_back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? t('reg_creating') : t('reg_create')}
              </button>
            </div>
          </div>
        )}

        {/* Link a login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('reg_have_account')}{' '}
          <button onClick={onVolverLogin} className="text-indigo-600 hover:underline font-medium">
            {t('reg_login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistroEvaluado;
