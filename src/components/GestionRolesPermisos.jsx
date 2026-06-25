import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Check, X, Info } from 'lucide-react';

const GestionRolesPermisos = ({ usuario }) => {
  const { t } = useTranslation();
  const [rolSeleccionado, setRolSeleccionado] = useState('administrador');

  // Role keys ('administrador', 'profesional', etc.) are data identifiers kept as-is
  const roles = {
    administrador: {
      nombre: t('role_admin'),
      descripcion: t('roles_desc_admin'),
      color: 'purple',
      permisos: {
        evaluacion: { ver: true, crear: true, editar: true, eliminar: true },
        dashboard: { ver: true, crear: true, editar: true, eliminar: true },
        usuarios: { ver: true, crear: true, editar: true, eliminar: true },
        reportes: { ver: true, crear: true, editar: true, eliminar: true },
        configuracion: { ver: true, crear: true, editar: true, eliminar: true },
        auditoria: { ver: true, crear: false, editar: false, eliminar: false },
        recomendaciones: { ver: true, crear: true, editar: true, eliminar: true }
      }
    },
    profesional: {
      nombre: t('roles_name_professional'),
      descripcion: t('roles_desc_professional'),
      color: 'blue',
      permisos: {
        evaluacion: { ver: true, crear: true, editar: true, eliminar: false },
        dashboard: { ver: true, crear: false, editar: false, eliminar: false },
        usuarios: { ver: false, crear: false, editar: false, eliminar: false },
        reportes: { ver: true, crear: true, editar: false, eliminar: false },
        configuracion: { ver: false, crear: false, editar: false, eliminar: false },
        auditoria: { ver: false, crear: false, editar: false, eliminar: false },
        recomendaciones: { ver: true, crear: true, editar: true, eliminar: false }
      }
    },
    coordinador: {
      nombre: t('role_coordinator'),
      descripcion: t('roles_desc_coordinator'),
      color: 'green',
      permisos: {
        evaluacion: { ver: true, crear: true, editar: false, eliminar: false },
        dashboard: { ver: true, crear: false, editar: false, eliminar: false },
        usuarios: { ver: true, crear: false, editar: false, eliminar: false },
        reportes: { ver: true, crear: true, editar: false, eliminar: false },
        configuracion: { ver: false, crear: false, editar: false, eliminar: false },
        auditoria: { ver: false, crear: false, editar: false, eliminar: false },
        recomendaciones: { ver: true, crear: false, editar: false, eliminar: false }
      }
    },
    evaluado: {
      nombre: t('role_evaluated'),
      descripcion: t('roles_desc_evaluated'),
      color: 'gray',
      permisos: {
        evaluacion: { ver: true, crear: true, editar: false, eliminar: false },
        dashboard: { ver: false, crear: false, editar: false, eliminar: false },
        usuarios: { ver: false, crear: false, editar: false, eliminar: false },
        reportes: { ver: false, crear: false, editar: false, eliminar: false },
        configuracion: { ver: false, crear: false, editar: false, eliminar: false },
        auditoria: { ver: false, crear: false, editar: false, eliminar: false },
        recomendaciones: { ver: true, crear: false, editar: false, eliminar: false }
      }
    }
  };

  // Module ids are data identifiers kept as-is
  const modulos = [
    { id: 'evaluacion', nombre: t('roles_mod_evaluacion'), descripcion: t('roles_mod_evaluacion_desc') },
    { id: 'dashboard', nombre: t('roles_mod_dashboard'), descripcion: t('roles_mod_dashboard_desc') },
    { id: 'usuarios', nombre: t('roles_mod_usuarios'), descripcion: t('roles_mod_usuarios_desc') },
    { id: 'reportes', nombre: t('roles_mod_reportes'), descripcion: t('roles_mod_reportes_desc') },
    { id: 'recomendaciones', nombre: t('roles_mod_recomendaciones'), descripcion: t('roles_mod_recomendaciones_desc') },
    { id: 'auditoria', nombre: t('roles_mod_auditoria'), descripcion: t('roles_mod_auditoria_desc') },
    { id: 'configuracion', nombre: t('roles_mod_configuracion'), descripcion: t('roles_mod_configuracion_desc') }
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', bgSolid: 'bg-purple-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', bgSolid: 'bg-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', bgSolid: 'bg-green-600' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', bgSolid: 'bg-gray-600' }
    };
    return colors[color] || colors.gray;
  };

  const rolActual = roles[rolSeleccionado];
  const colorClasses = getColorClasses(rolActual.color);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          {t('roles_title')}
        </h1>
        <p className="text-gray-600">{t('roles_subtitle')}</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">{t('roles_info_title')}</p>
          <p className="mt-1">{t('roles_info_text')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de roles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('roles_system_roles')}
            </h3>
            <div className="space-y-2">
              {Object.entries(roles).map(([key, rol]) => {
                const colors = getColorClasses(rol.color);
                return (
                  <button
                    key={key}
                    onClick={() => setRolSeleccionado(key)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      rolSeleccionado === key
                        ? `${colors.bg} ${colors.border} border-2`
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <p className={`font-medium ${rolSeleccionado === key ? colors.text : 'text-gray-800'}`}>
                      {rol.nombre}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rol.descripcion}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Matriz de permisos */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{rolActual.nombre}</h3>
                <p className="text-sm text-gray-500">{rolActual.descripcion}</p>
              </div>
              {/* rolSeleccionado is a data identifier kept as-is */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                {rolSeleccionado}
              </span>
            </div>

            {/* Tabla de permisos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t('roles_module')}</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">{t('roles_perm_view')}</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">{t('roles_perm_create')}</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">{t('roles_perm_edit')}</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">{t('roles_perm_delete')}</th>
                  </tr>
                </thead>
                <tbody>
                  {modulos.map((modulo) => {
                    const permisos = rolActual.permisos[modulo.id];
                    return (
                      <tr key={modulo.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{modulo.nombre}</p>
                          <p className="text-xs text-gray-500">{modulo.descripcion}</p>
                        </td>
                        <td className="text-center py-3 px-4">
                          {permisos?.ver ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                              <Check className="w-5 h-5 text-green-600" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                              <X className="w-5 h-5 text-red-600" />
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {permisos?.crear ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                              <Check className="w-5 h-5 text-green-600" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                              <X className="w-5 h-5 text-red-600" />
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {permisos?.editar ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                              <Check className="w-5 h-5 text-green-600" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                              <X className="w-5 h-5 text-red-600" />
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {permisos?.eliminar ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                              <Check className="w-5 h-5 text-green-600" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                              <X className="w-5 h-5 text-red-600" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div className="mt-6 pt-4 border-t flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                </span>
                <span className="text-gray-600">{t('roles_perm_granted')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                  <X className="w-4 h-4 text-red-600" />
                </span>
                <span className="text-gray-600">{t('roles_perm_denied')}</span>
              </div>
            </div>
          </div>

          {/* Resumen de acceso */}
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">{t('roles_accessible_for')} {rolActual.nombre}</h3>
            <div className="flex flex-wrap gap-2">
              {modulos
                .filter(m => rolActual.permisos[m.id]?.ver)
                .map(modulo => (
                  <span
                    key={modulo.id}
                    className={`px-3 py-1 rounded-full text-sm ${colorClasses.bg} ${colorClasses.text}`}
                  >
                    {modulo.nombre}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionRolesPermisos;
