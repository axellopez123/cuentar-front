import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { User, CardType } from '../../types';
import { api } from '../../api/client';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: () => void;
  users: User[];
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onCardCreated,
  users,
}) => {
  const [alias, setAlias] = useState('');
  const [cardType, setCardType] = useState<CardType>('credit');
  const [userId, setUserId] = useState(users[0]?.id || '');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [statementClosingDay, setStatementClosingDay] = useState('');
  const [paymentDueDay, setPaymentDueDay] = useState('');
  const [colorHex, setColorHex] = useState('#2563EB');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        alias,
        card_type: cardType,
        user_id: userId || undefined,
        currency: 'MXN',
        credit_limit: cardType === 'credit' ? creditLimit || '0.00' : '0.00',
        current_balance: cardType === 'debit' ? currentBalance || '0.00' : creditLimit || '0.00',
        monthly_budget_limit: budgetLimit ? budgetLimit : undefined,
        statement_closing_day: cardType === 'credit' && statementClosingDay ? parseInt(statementClosingDay) : undefined,
        payment_due_day: cardType === 'credit' && paymentDueDay ? parseInt(paymentDueDay) : undefined,
        color_hex: colorHex,
      };

      await api.createCard(payload);
      onCardCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarjeta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nueva Tarjeta o Cuenta</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre / Alias
            </label>
            <input
              type="text"
              required
              placeholder="ej. Nu Débito, BBVA Platino, Hey Banco"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tipo de Cuenta
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as CardType)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="credit">Crédito</option>
                <option value="debit">Débito</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Propietario
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cardType === 'credit' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Línea de Crédito Total ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="ej. 50000.00"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Saldo Inicial Disponible ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="ej. 15000.00"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tope / Límite de Gasto Mensual Voluntario ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Opcional: alerta si se supera este monto en el mes"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {cardType === 'credit' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Día de Corte (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  placeholder="ej. 15"
                  value={statementClosingDay}
                  onChange={(e) => setStatementClosingDay(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Día Límite de Pago (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  placeholder="ej. 5"
                  value={paymentDueDay}
                  onChange={(e) => setPaymentDueDay(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Color de Tarjeta
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
              <span className="text-xs font-mono text-slate-600">{colorHex}</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

