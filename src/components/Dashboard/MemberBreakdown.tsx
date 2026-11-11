import React from 'react';
import { Users, User, HeartHandshake } from 'lucide-react';
import { ParticipantBreakdownItem } from '../../types';

interface MemberBreakdownProps {
  participants: ParticipantBreakdownItem[];
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(isNaN(num) ? 0 : num);
};

export const MemberBreakdown: React.FC<MemberBreakdownProps> = ({ participants }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Gastos por Participante (Ciclo Actual)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribución de gastos entre pareja, familia y miembros
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {participants.map((p) => {
          return (
            <div key={p.user_id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {p.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">{p.full_name}</span>
                    <span className="ml-2 text-[11px] font-semibold text-slate-400 capitalize">
                      ({p.role})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">
                    {formatCurrency(p.total_spent)}
                  </span>
                  <span className="ml-2 text-xs font-semibold text-blue-600">
                    ({p.percentage_of_total.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(2, p.percentage_of_total))}%` }}
                />
              </div>

              {/* Sub-breakdown (shared vs personal) */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <HeartHandshake className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Compartido:</span>
                  <strong className="text-slate-800">{formatCurrency(p.shared_spent)}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Personal:</span>
                  <strong className="text-slate-800">{formatCurrency(p.personal_spent)}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

