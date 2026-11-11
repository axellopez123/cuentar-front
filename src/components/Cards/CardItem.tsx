import React from 'react';
import { CreditCard, RotateCcw, Plus, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Card } from '../../types';

interface CardItemProps {
  card: Card;
  onAddExpense: (cardId: string) => void;
  onPayCard: (cardId: string) => void;
  onResetPeriod: (cardId: string) => void;
}

const formatCurrency = (amount: string | number | undefined | null) => {
  if (!amount) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(isNaN(num) ? 0 : num);
};

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onAddExpense,
  onPayCard,
  onResetPeriod,
}) => {
  const isCredit = card.card_type === 'credit';
  const status = card.status;
  const cycle = status?.billing_cycle;
  const budget = status?.budget;

  const bgCardColor = card.color_hex || (isCredit ? '#1E40AF' : '#059669');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* Visual Card Banner */}
      <div
        className="p-5 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${bgCardColor} 0%, #111827 100%)`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-white/80" />
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              {isCredit ? 'Crédito' : 'Débito'}
            </span>
          </div>
          <span className="text-xs font-medium text-white/70">{card.currency}</span>
        </div>

        <div className="text-xl font-black tracking-tight mb-2">{card.alias}</div>

        <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
          <div>
            <div className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">
              {isCredit ? 'Disponible' : 'Saldo Actual'}
            </div>
            <div className="text-lg font-extrabold">
              {formatCurrency(card.current_balance)}
            </div>
          </div>
          {isCredit && (
            <div className="text-right">
              <div className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">
                Línea Total
              </div>
              <div className="text-sm font-bold text-white/90">
                {formatCurrency(card.credit_limit)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details & Metrics Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Spent this period */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">Gastado en periodo:</span>
          <span className="font-extrabold text-slate-900 text-base">
            {formatCurrency(card.spent_this_period)}
          </span>
        </div>

        {/* Voluntary Budget Limit Bar (if defined) */}
        {budget && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                Límite Presupuestal:
                {budget.is_exceeded && (
                  <span className="text-rose-600 font-bold flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Excedido
                  </span>
                )}
              </span>
              <span className="font-bold text-slate-900">
                {formatCurrency(card.spent_this_period)} / {formatCurrency(budget.monthly_budget_limit)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  budget.is_exceeded
                    ? 'bg-rose-500'
                    : budget.usage_percentage > 80
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, budget.usage_percentage)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Uso: {budget.usage_percentage.toFixed(0)}%</span>
              <span>Restante: {formatCurrency(budget.remaining_budget)}</span>
            </div>
          </div>
        )}

        {/* Credit Card Key Billing Dates */}
        {isCredit && cycle && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
              <span className="text-slate-500 block font-medium">Día de Corte:</span>
              <strong className="text-slate-900 block mt-0.5">{cycle.next_closing_date}</strong>
              <span className="text-[11px] text-blue-700 font-semibold">
                Faltan {cycle.days_until_closing} días
              </span>
            </div>

            <div
              className={`p-2.5 rounded-lg border ${
                cycle.is_due_imminent
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50/60 border-emerald-100'
              }`}
            >
              <span className="text-slate-500 block font-medium">Límite de Pago:</span>
              <strong className="text-slate-900 block mt-0.5">{cycle.next_due_date}</strong>
              <span
                className={`text-[11px] font-bold ${
                  cycle.is_due_imminent ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {cycle.days_until_due <= 0
                  ? '¡Vence hoy!'
                  : `Faltan ${cycle.days_until_due} días`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddExpense(card.id)}
            title="Registrar gasto con esta tarjeta"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Gasto
          </button>
          {isCredit && (
            <button
              onClick={() => onPayCard(card.id)}
              title="Registrar pago / abono"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Pagar
            </button>
          )}
        </div>

        {isCredit && (
          <button
            onClick={() => onResetPeriod(card.id)}
            title="Reiniciar periodo de corte (nuevo ciclo)"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
