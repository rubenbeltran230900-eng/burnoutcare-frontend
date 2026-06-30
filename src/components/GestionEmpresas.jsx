import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Plus, Edit, Trash2, Users, ChevronRight, ChevronLeft, ToggleLeft, ToggleRight, X, Check, UserPlus, Shield } from 'lucide-react';
import { empresasService, usuariosService } from '../services/api';

// Data identifiers kept as-is: sector/tamanio option values are used as API data keys
const ROLES = ['administrador', 'profesional', 'coordinador', 'evaluado'];
const SECTORES = ['Manufactura', 'Salud', 'Educación', 'Servicios', 'Construcción', 'Tecnología', 'Comercio', 'Otro'];
const TAMANIOS = ['Micro (1-10)', 'Pequeña (11-50)', 'Mediana (51-250)', 'Grande (250+)'];

const Modal = ({ titulo, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-lg font-bold text-gray-800">{titulo}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
  </div>
);

const Select = ({ label, value, onChange, options, required, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const GestionEmpresas = () => {
  const { t } = useTranslation();
  const [vista, setVista] = useState('empresas'); // 'empresas' | 'usuarios'
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'empresa' | 'usuario' | 'confirmar'
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formEmpresa, setFormEmpresa] = useState({ nombre: '', sector: '', tamanio: '', contacto_nombre: '', contacto_email: '' });
  const [formUsuario, setFormUsuario] = useState({ nombre: '', email: '', password: '', rol: 'evaluado', area: '', puesto: '' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [empresaEditando, setEmpresaEditando] = useState(null);

  useEffect(() => { cargarEmpresas(); }, []);

  const cargarEmpresas = async () => {
    setCargando(true); setError('');
    try {
      const res = await empresasService.obtenerTodas();
      if (res.success) setEmpresas(res.data);
    } catch { setError(t('msg_connection_error')); }
    finally { setCargando(false); }
  };

  const cargarUsuarios = async (empresaId) => {
    setCargando(true);
    try {
      const res = await empresasService.obtenerUsuarios(empresaId);
      if (res.success) setUsuarios(res.data);
    } catch (err) { console.error('Error detallado:', err); setError(t('msg_connection_error')); }
    finally { setCargando(false); }
  };

 const entrarEmpresa = async (empresa) => {
  setEmpresaSeleccionada(empresa);
  setVista('usuarios');
  setCargando(true);
  setError('');
  try {
    const res = await empresasService.obtenerUsuarios(empresa.id);
    if (res.success) setUsuarios(res.data);
  } catch (err) {
    console.error('Error en entrarEmpresa:', err);
    setError(t('msg_connection_error'));
  } finally {
    setCargando(false);
  }
};

  const volverEmpresas = () => {
    setVista('empresas');
    setEmpresaSeleccionada(null);
    setUsuarios([]);
    cargarEmpresas();
  };

  // ── EMPRESAS ──────────────────────────────────────────
  const abrirCrearEmpresa = () => {
    setFormEmpresa({ nombre: '', sector: '', tamanio: '', contacto_nombre: '', contacto_email: '' });
    setEmpresaEditando(null);
    setModal('empresa');
  };

  const abrirEditarEmpresa = (empresa) => {
    setFormEmpresa({ nombre: empresa.nombre, sector: empresa.sector || '', tamanio: empresa.tamanio || '', contacto_nombre: empresa.contacto_nombre || '', contacto_email: empresa.contacto_email || '' });
    setEmpresaEditando(empresa);
    setModal('empresa');
  };

  const guardarEmpresa = async () => {
    if (!formEmpresa.nombre) return;
    setGuardando(true);
    try {
      if (empresaEditando) {
        await empresasService.actualizar(empresaEditando.id, formEmpresa);
      } else {
        await empresasService.crear(formEmpresa);
      }
      setModal(null);
      cargarEmpresas();
    } catch { setError(t('msg_connection_error')); }
    finally { setGuardando(false); }
  };

  const toggleEmpresa = async (empresa) => {
    try {
      await empresasService.toggleActivo(empresa.id);
      cargarEmpresas();
    } catch { setError(t('msg_connection_error')); }
  };

  const confirmarEliminarEmpresa = (empresa) => {
    setItemAEliminar({ tipo: 'empresa', item: empresa });
    setModal('confirmar');
  };

  // ── USUARIOS ──────────────────────────────────────────
  const abrirCrearUsuario = () => {
    setFormUsuario({ nombre: '', email: '', password: '', rol: 'evaluado', area: '', puesto: '' });
    setUsuarioEditando(null);
    setModal('usuario');
  };

  const abrirEditarUsuario = (usuario) => {
    setFormUsuario({ nombre: usuario.nombre, email: usuario.email, password: '', rol: usuario.rol, area: usuario.area || '', puesto: usuario.puesto || '' });
    setUsuarioEditando(usuario);
    setModal('usuario');
  };

  const guardarUsuario = async () => {
    if (!formUsuario.nombre || !formUsuario.email) return;
    if (!usuarioEditando && !formUsuario.password) return;
    setGuardando(true);
    try {
      const data = { ...formUsuario, empresa_id: empresaSeleccionada.id };
      if (usuarioEditando) {
        if (!data.password) delete data.password;
        await usuariosService.actualizar(usuarioEditando.id, data);
      } else {
        await usuariosService.crear(data);
      }
      setModal(null);
      await cargarUsuarios(empresaSeleccionada.id);
    } catch { setError(t('msg_connection_error')); }
    finally { setGuardando(false); }
  };

  const toggleUsuario = async (usuario) => {
    try {
      await usuariosService.actualizar(usuario.id, { activo: !usuario.activo });
      await cargarUsuarios(empresaSeleccionada.id);
    } catch { setError(t('msg_connection_error')); }
  };

  const confirmarEliminarUsuario = (usuario) => {
    setItemAEliminar({ tipo: 'usuario', item: usuario });
    setModal('confirmar');
  };

  const ejecutarEliminar = async () => {
    if (!itemAEliminar) return;
    setGuardando(true);
    try {
      if (itemAEliminar.tipo === 'empresa') {
        await empresasService.eliminar(itemAEliminar.item.id);
        setModal(null);
        cargarEmpresas();
      } else {
        await usuariosService.eliminar(itemAEliminar.item.id);
        setModal(null);
       await cargarUsuarios(empresaSeleccionada.id);
      }
    } catch (err) {
      setError(err.message || t('msg_connection_error'));
      setModal(null);
    }
    finally { setGuardando(false); }
  };

  const rolColor = {
    administrador: 'bg-purple-100 text-purple-700',
    profesional:   'bg-blue-100 text-blue-700',
    coordinador:   'bg-green-100 text-green-700',
    evaluado:      'bg-gray-100 text-gray-700',
  };

  // ══════════════════════════════════════════════════════
  // VISTA: EMPRESAS
  // ══════════════════════════════════════════════════════
  if (vista === 'empresas') return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" /> {t('company_title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t('company_subtitle')}</p>
        </div>
        <button onClick={abrirCrearEmpresa}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-4 h-4" /> {t('company_new')}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      {/* Contador */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-blue-600">{empresas.length}</p>
          <p className="text-sm text-gray-500">{t('company_total')}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">{empresas.filter(e => e.activo).length}</p>
          <p className="text-sm text-gray-500">{t('company_active')}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-400">{empresas.filter(e => !e.activo).length}</p>
          <p className="text-sm text-gray-500">{t('company_inactive')}</p>
        </div>
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="text-center py-12 text-gray-400">{t('company_loading')}</div>
      ) : empresas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('company_none')}</p>
          <button onClick={abrirCrearEmpresa} className="mt-3 text-blue-600 hover:underline text-sm">{t('company_create_first')}</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {empresas.map(empresa => (
            <div key={empresa.id} className={`bg-white rounded-xl border-2 p-5 transition-all ${empresa.activo ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-800">{empresa.nombre}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${empresa.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {empresa.activo ? t('company_status_active') : t('company_status_inactive')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {empresa.sector && <span>📂 {empresa.sector}</span>}
                    {empresa.tamanio && <span>🏢 {empresa.tamanio}</span>}
                    {empresa.contacto_nombre && <span>👤 {empresa.contacto_nombre}</span>}
                    {empresa.contacto_email && <span>✉️ {empresa.contacto_email}</span>}
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-blue-600 font-medium">{t('company_users_count', { count: empresa.total_usuarios || 0 })}</span>
                    <span className="text-green-600">{t('company_users_active_count', { count: empresa.usuarios_activos || 0 })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => entrarEmpresa(empresa)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <Users className="w-4 h-4" /> {t('company_users_btn')} <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => abrirEditarEmpresa(empresa)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleEmpresa(empresa)}
                    className={`p-2 rounded-lg transition-colors ${empresa.activo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    {empresa.activo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => confirmarEliminarEmpresa(empresa)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal empresa */}
      {modal === 'empresa' && (
        <Modal titulo={empresaEditando ? t('company_modal_edit') : t('company_modal_new')} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Input label={t('company_name')} value={formEmpresa.nombre} onChange={v => setFormEmpresa({...formEmpresa, nombre: v})} placeholder={t('company_placeholder_name')} required />
            <Select label={t('company_sector')} value={formEmpresa.sector} onChange={v => setFormEmpresa({...formEmpresa, sector: v})} options={SECTORES} placeholder={t('company_select')} />
            <Select label={t('company_size')} value={formEmpresa.tamanio} onChange={v => setFormEmpresa({...formEmpresa, tamanio: v})} options={TAMANIOS} placeholder={t('company_select')} />
            <Input label={t('company_contact_name')} value={formEmpresa.contacto_nombre} onChange={v => setFormEmpresa({...formEmpresa, contacto_nombre: v})} placeholder={t('company_placeholder_contact')} />
            <Input label={t('company_contact_email')} value={formEmpresa.contacto_email} onChange={v => setFormEmpresa({...formEmpresa, contacto_email: v})} placeholder="contacto@empresa.com" type="email" />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button onClick={guardarEmpresa} disabled={!formEmpresa.nombre || guardando}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> {guardando ? t('company_saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal confirmar eliminar */}
      {modal === 'confirmar' && itemAEliminar && (
        <Modal titulo={t('company_confirm_delete')} onClose={() => setModal(null)}>
          <p className="text-gray-600 mb-6">{t('company_confirm_delete_msg', { name: itemAEliminar.item.nombre })}</p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button onClick={ejecutarEliminar} disabled={guardando}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> {guardando ? t('company_deleting') : t('delete')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════
  // VISTA: USUARIOS DE EMPRESA
  // ══════════════════════════════════════════════════════
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button onClick={volverEmpresas} className="flex items-center gap-1 text-blue-600 hover:underline text-sm mb-2">
            <ChevronLeft className="w-4 h-4" /> {t('company_back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" /> {empresaSeleccionada?.nombre}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t('company_users_registered')}</p>
        </div>
        <button onClick={abrirCrearUsuario}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <UserPlus className="w-4 h-4" /> {t('users_new')}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      {/* Contadores por rol */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {ROLES.map(rol => (
          <div key={rol} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xl font-bold text-gray-700">{usuarios.filter(u => u.rol === rol).length}</p>
            {/* rol values are data identifiers kept as-is */}
            <p className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${rolColor[rol]}`}>{rol}</p>
          </div>
        ))}
      </div>

      {/* Lista de usuarios */}
      {cargando ? (
        <div className="text-center py-12 text-gray-400">{t('company_loading_users')}</div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('company_no_users')}</p>
          <button onClick={abrirCrearUsuario} className="mt-3 text-blue-600 hover:underline text-sm">{t('company_create_first_user')}</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('company_col_user')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('company_col_role')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('company_col_area')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('company_col_status')}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('company_col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map(usuario => (
                <tr key={usuario.id} className={`hover:bg-gray-50 ${!usuario.activo ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{usuario.nombre}</p>
                    <p className="text-xs text-gray-500">{usuario.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {/* rol value is a data identifier kept as-is */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${rolColor[usuario.rol] || 'bg-gray-100 text-gray-600'}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {usuario.area && <p>{usuario.area}</p>}
                    {usuario.puesto && <p className="text-xs text-gray-400">{usuario.puesto}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${usuario.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {usuario.activo ? t('company_status_active') : t('company_status_inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => abrirEditarUsuario(usuario)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleUsuario(usuario)}
                        className={`p-1.5 rounded transition-colors ${usuario.activo ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                        {usuario.activo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => confirmarEliminarUsuario(usuario)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal usuario */}
      {modal === 'usuario' && (
        <Modal titulo={usuarioEditando ? t('company_modal_edit_user') : t('company_modal_new_user')} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Input label={t('users_name')} value={formUsuario.nombre} onChange={v => setFormUsuario({...formUsuario, nombre: v})} placeholder={t('users_full_name_placeholder')} required />
            <Input label={t('users_email')} value={formUsuario.email} onChange={v => setFormUsuario({...formUsuario, email: v})} placeholder={t('company_placeholder_user_email')} type="email" required />
            <Input label={usuarioEditando ? t('company_user_new_password') : t('users_password')} value={formUsuario.password} onChange={v => setFormUsuario({...formUsuario, password: v})} placeholder="••••••••" type="password" required={!usuarioEditando} />
            <Select label={t('users_role')} value={formUsuario.rol} onChange={v => setFormUsuario({...formUsuario, rol: v})} options={ROLES} placeholder={t('company_select')} required />
            <Input label={t('company_user_area')} value={formUsuario.area} onChange={v => setFormUsuario({...formUsuario, area: v})} placeholder={t('users_placeholder_area')} />
            <Input label={t('company_user_position')} value={formUsuario.puesto} onChange={v => setFormUsuario({...formUsuario, puesto: v})} placeholder={t('users_placeholder_position')} />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button onClick={guardarUsuario}
              disabled={!formUsuario.nombre || !formUsuario.email || (!usuarioEditando && !formUsuario.password) || guardando}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> {guardando ? t('company_saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal confirmar eliminar */}
      {modal === 'confirmar' && itemAEliminar && (
        <Modal titulo={t('company_confirm_delete')} onClose={() => setModal(null)}>
          <p className="text-gray-600 mb-6">{t('company_confirm_delete_msg', { name: itemAEliminar.item.nombre })}</p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button onClick={ejecutarEliminar} disabled={guardando}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> {guardando ? t('company_deleting') : t('delete')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GestionEmpresas;
