import React, { useState } from 'react';
import { X, Receipt, Upload } from 'lucide-react';
import { Card, Category, User } from '../../types';
import { api } from '../../api/client';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
  cards: Card[];
  categories: Category[];
  users: User[];
  defaultCardId?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseCreated,
  cards,
  categories,
  users,
  defaultCardId,
}) => {
  const [cardId, setCardId] = useState(defaultCardId || cards[0]?.id || '');
  const [userId, setUserId] = useState(users[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Shared Expense
  const [isShared, setIsShared] = useState(false);
  const [sharedSplitRatio, setSharedSplitRatio] = useState('50.00');

  // Meses Sin Intereses (MSI)
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState('6');

  // File Attachments
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        card_id: cardId,
        user_id: userId || undefined,
        category_id: categoryId || undefined,
        amount: amount,
        description: description.trim(),
        transaction_date: new Date(transactionDate).toISOString(),
        is_shared: isShared,
        shared_split_ratio: isShared ? sharedSplitRatio : '0.00',
        is_installment: isInstallment,
        installment_months: isInstallment ? parseInt(installmentMonths) : undefined,
      };

      const tx: any = await api.createExpense(payload);

      // Upload receipts if selected
      if (files.length > 0 && tx?.id) {
        await api.uploadAttachments(tx.id, files);
      }

      onExpenseCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el gasto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Registrar Compra / Gasto</h3>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Monto ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="ej. 350.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Descripción del Gasto
            </label>
            <input
              type="text"
              required
              placeholder="ej. Supermercado semanal, Gasolina, Cena"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tarjeta / Cuenta
              </label>
              <select
                required
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.alias} ({c.card_type === 'credit' ? 'Crédito' : 'Débito'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Responsable
              </label>
              <select
                required
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">(Sin categoría)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gasto Compartido */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Gasto Compartido del Hogar</span>
                <p className="text-[11px] text-slate-500">¿Se divide entre ambos o la familia?</p>
              </div>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            {isShared && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Porcentaje asignado a pareja:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sharedSplitRatio}
                    onChange={(e) => setSharedSplitRatio(e.target.value)}
                    className="w-16 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
            )}
          </div>

          {/* Meses Sin Intereses (MSI) */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Compra a Meses Sin Intereses (MSI)</span>
                <p className="text-[11px] text-slate-500">Financiamiento a plazo fijo sin interés</p>
              </div>
              <input
                type="checkbox"
                checked={isInstallment}
                onChange={(e) => setIsInstallment(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            {isInstallment && (
              <div className="mt-3 pt-3 border-t border-blue-200/60 grid grid-cols-2 gap-3 items-center">
                <span className="text-xs text-slate-700 font-semibold">Plazo en meses:</span>
                <select
                  value={installmentMonths}
                  onChange={(e) => setInstallmentMonths(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg"
                >
                  <option value="3">3 Meses</option>
                  <option value="6">6 Meses</option>
                  <option value="9">9 Meses</option>
                  <option value="12">12 Meses</option>
                  <option value="18">18 Meses</option>
                  <option value="24">24 Meses</option>
                </select>
              </div>
            )}
          </div>

          {/* Comprobante / Recibo File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Comprobante / Ticket / Factura (PDF o Imagen)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-file-upload"
              />
              <label htmlFor="receipt-file-upload" className="cursor-pointer block">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-blue-600">
                  {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : 'Subir archivo o foto'}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP o PDF hasta 10 MB</p>
              </label>
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
              {loading ? 'Guardando...' : 'Guardar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
