import React from 'react';
import { CreditCard, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { DashboardTotals } from '../../types';

interface MetricCardsProps {
  totals: DashboardTotals;
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(isNaN(num) ? 0 : num);
};

export const MetricCards: React.FC<MetricCardsProps> = ({ totals }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total gastado en TC */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Deuda / Gastado en Tarjetas
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900">
          {formatCurrency(totals.total_credit_spent)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <span>Línea total asignada:</span>
          <span className="font-semibold text-slate-700">{formatCurrency(totals.total_credit_limit)}</span>
        </div>
      </div>

      {/* Saldo en Débito */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Saldo Disponible en Débito
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900">
          {formatCurrency(totals.total_debit_balance)}
        </div>
        <div className="mt-2 text-xs text-emerald-600 font-medium">
          Disponible inmediato en cuentas líquidas
        </div>
      </div>

      {/* Gastos del Periodo */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Gastos Totales del Mes
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900">
          {formatCurrency(totals.total_period_expenses)}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Acumulado registrado en el mes actual
        </div>
      </div>

      {/* Cupo disponible en crédito */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Crédito Libre Disponible
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900">
          {formatCurrency(
            Math.max(0, parseFloat(totals.total_credit_limit) - parseFloat(totals.total_credit_spent))
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Margen seguro para compras e imprevistos
        </div>
      </div>
    </div>
  );
};

