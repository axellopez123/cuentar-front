import React, { useState } from 'react';
import { UserPlus, Shield } from 'lucide-react';
import { User, UserRole } from '../../types';
import { api } from '../../api/client';

interface MembersViewProps {
  users: User[];
  onMemberAdded: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ users, onMemberAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password] = useState('Temporal123!');
  const [role, setRole] = useState<UserRole>('partner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.createUser({
        full_name: fullName,
        email,
        password,
        role,
      });
      setFullName('');
      setEmail('');
      setShowAddForm(false);
      onMemberAdded();
    } catch (err: any) {
      setError(err.message || 'Error al agregar miembro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Participantes del Hogar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Miembros con los que compartes gastos, tarjetas y presupuestos familiares.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? 'Cancelar' : 'Agregar Participante'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMember} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" /> Registrar Nuevo Participante
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                placeholder="ej. Maria Lopez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="maria@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="partner">Mi Pareja</option>
                <option value="primary">Titular Principal</option>
                <option value="member">Otro Familiar / Miembro</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      )}

      {/* Grid of members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const roleBadgeColor = {
            primary: 'bg-blue-50 text-blue-700 border-blue-200',
            partner: 'bg-rose-50 text-rose-700 border-rose-200',
            member: 'bg-slate-100 text-slate-700 border-slate-200',
          }[u.role];

          return (
            <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center font-black text-base flex-shrink-0">
                {u.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">{u.full_name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${roleBadgeColor}`}>
                    {u.role === 'primary' ? 'Titular' : u.role === 'partner' ? 'Mi Pareja' : 'Miembro'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{u.email}</div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" /> Activo en el sistema
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
