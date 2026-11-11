import React from 'react';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UpcomingPaymentItem } from '../../types';

interface UpcomingPaymentsProps {
  payments: UpcomingPaymentItem[];
  onPayCard: (cardId: string) => void;
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(isNaN(num) ? 0 : num);
};

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ payments, onPayCard }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Próximos Vencimientos y Pagos de Tarjetas
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordenados por fecha límite de pago más próxima
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {payments.length} pendientes
        </span>
      </div>

      {payments.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">¡Al día con los pagos!</p>
          <p className="text-xs text-slate-500 mt-1">No tienes pagos urgentes pendientes para este periodo.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {payments.map((p) => {
            const isUrgent = p.is_due_imminent || p.days_until_due <= 5;
            return (
              <div
                key={p.card_id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{p.alias}</span>
                      <span className="text-[11px] font-medium text-slate-400">• {p.owner_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-600">
                        Límite: <strong className="text-slate-800">{p.payment_due_date}</strong>
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.days_until_due === 0
                          ? '¡Vence hoy!'
                          : p.days_until_due < 0
                          ? `Venció hace ${Math.abs(p.days_until_due)} días`
                          : `Faltan ${p.days_until_due} días`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Monto a pagar</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(p.amount_to_pay)}
                    </span>
                  </div>
                  <button
                    onClick={() => onPayCard(p.card_id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    Abonar / Pagar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

