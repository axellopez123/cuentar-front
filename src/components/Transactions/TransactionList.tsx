import React, { useState } from 'react';
import { FileText, ArrowDownLeft, ArrowUpRight, Search, HeartHandshake } from 'lucide-react';
import { Transaction, Card } from '../../types';
import { api } from '../../api/client';

interface TransactionListProps {
  transactions: Transaction[];
  cards: Card[];
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(isNaN(num) ? 0 : num);
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, cards }) => {
  const [filterCard, setFilterCard] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = transactions.filter((tx) => {
    if (filterCard !== 'all' && tx.card_id !== filterCard) return false;
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCard = tx.card_alias?.toLowerCase().includes(q);
      const matchUser = tx.user_name?.toLowerCase().includes(q);
      return matchDesc || matchCard || matchUser;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Filters Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por concepto o tarjeta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterCard}
            onChange={(e) => setFilterCard(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
          >
            <option value="all">Todas las Tarjetas</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.alias}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
          >
            <option value="all">Todos los Movimientos</option>
            <option value="expense">Solo Gastos</option>
            <option value="payment">Solo Pagos / Abonos</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No hay transacciones registradas con los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Descripción & Detalles</th>
                <th className="py-3 px-4">Tarjeta</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Evidencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => {
                const isExpense = tx.type === 'expense';
                const formattedDate = new Date(tx.transaction_date).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {formattedDate}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{tx.description}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {tx.category_name && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {tx.category_name}
                          </span>
                        )}
                        {tx.is_installment && tx.installment_plan && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                            MSI ({tx.installment_plan.total_installments} meses - {formatCurrency(tx.installment_plan.monthly_amount)}/mes)
                          </span>
                        )}
                        {tx.is_shared && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200 flex items-center gap-1">
                            <HeartHandshake className="w-3 h-3" /> Compartido ({parseFloat(tx.shared_split_ratio)}%)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {tx.card_alias || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {tx.user_name || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`text-sm font-extrabold flex items-center justify-end gap-1 ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? (
                          <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        )}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {tx.attachments && tx.attachments.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          {tx.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={api.getAttachmentDownloadUrl(att.id)}
                              target="_blank"
                              rel="noreferrer"
                              title={`Descargar ${att.file_name}`}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
