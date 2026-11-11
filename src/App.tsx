import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api/client';
import {
  DashboardResponse,
  Card,
  Transaction,
  User,
  Category,
} from './types';

import { Navbar } from './components/Navbar';
import { MetricCards } from './components/Dashboard/MetricCards';
import { UpcomingPayments } from './components/Dashboard/UpcomingPayments';
import { MemberBreakdown } from './components/Dashboard/MemberBreakdown';
import { CardItem } from './components/Cards/CardItem';
import { CardModal } from './components/Cards/CardModal';
import { ExpenseModal } from './components/Transactions/ExpenseModal';
import { PaymentModal } from './components/Transactions/PaymentModal';
import { TransactionList } from './components/Transactions/TransactionList';
import { MembersView } from './components/Members/MembersView';
import { LoginForm } from './components/Auth/LoginForm';
import { Plus, CreditCard, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'transactions' | 'members'>('dashboard');

  // Data states
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals state
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);

  const loadData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [dashData, cardsData, txsData, usersData, catsData] = await Promise.all([
        api.getDashboard() as Promise<DashboardResponse>,
        api.getCards() as Promise<Card[]>,
        api.getTransactions() as Promise<Transaction[]>,
        api.getUsers() as Promise<User[]>,
        api.getCategories() as Promise<Category[]>,
      ]);

      // Enrich cards with status from dashboard
      const enrichedCards = cardsData.map((c) => {
        const matchingStatus = dashData.cards_summary.find((s) => s.card_id === c.id);
        return { ...c, status: matchingStatus };
      });

      setDashboard(dashData);
      setCards(enrichedCards);
      setTransactions(txsData);
      setUsers(usersData);
      setCategories(catsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">
        Cargando Cuentar...
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleOpenExpenseForCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsExpenseOpen(true);
  };

  const handleOpenPaymentForCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsPaymentOpen(true);
  };

  const handleResetPeriod = async (cardId: string) => {
    if (confirm('¿Estás seguro de reiniciar el saldo gastado para el nuevo periodo de corte?')) {
      try {
        await api.resetCardPeriod(cardId);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Error al reiniciar periodo.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExpenseModal={() => {
          setSelectedCardId(undefined);
          setIsExpenseOpen(true);
        }}
        onOpenPaymentModal={() => {
          setSelectedCardId(undefined);
          setIsPaymentOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Control Financiero del Hogar
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Resumen de tarjetas, límites de crédito y gastos compartidos en el ciclo {dashboard.period_month}.
                </p>
              </div>
              <button
                onClick={loadData}
                disabled={dataLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 self-start sm:self-auto"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
                Actualizar datos
              </button>
            </div>

            {/* Metric Cards */}
            <MetricCards totals={dashboard.totals} />

            {/* Grid: Upcoming Payments & Member Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingPayments
                payments={dashboard.upcoming_payments}
                onPayCard={handleOpenPaymentForCard}
              />
              <MemberBreakdown participants={dashboard.participants_breakdown} />
            </div>

            {/* Active Cards Snapshot */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tus Tarjetas y Cuentas</h3>
                  <p className="text-xs text-slate-500">Monitoreo de cupo y fechas de corte</p>
                </div>
                <button
                  onClick={() => setIsCardModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Tarjeta
                </button>
              </div>

              {cards.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No tienes tarjetas registradas aún</p>
                  <button
                    onClick={() => setIsCardModalOpen(true)}
                    className="mt-3 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                  >
                    + Registrar mi primera tarjeta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cards.map((c) => (
                    <CardItem
                      key={c.id}
                      card={c}
                      onAddExpense={handleOpenExpenseForCard}
                      onPayCard={handleOpenPaymentForCard}
                      onResetPeriod={handleResetPeriod}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CARDS */}
        {activeTab === 'cards' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Tarjetas y Cuentas Bancarias
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Administra tarjetas de crédito y débito con sus límites de gasto y fechas de corte.
                </p>
              </div>
              <button
                onClick={() => setIsCardModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" /> Nueva Tarjeta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((c) => (
                <CardItem
                  key={c.id}
                  card={c}
                  onAddExpense={handleOpenExpenseForCard}
                  onPayCard={handleOpenPaymentForCard}
                  onResetPeriod={handleResetPeriod}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Historial de Movimientos
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Registro detallado de gastos, abonos, comprobantes adjuntos y compras a meses.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl"
                >
                  + Abono / Pago
                </button>
                <button
                  onClick={() => setIsExpenseOpen(true)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  + Gasto
                </button>
              </div>
            </div>

            <TransactionList transactions={transactions} cards={cards} />
          </div>
        )}

        {/* TAB 4: MEMBERS */}
        {activeTab === 'members' && (
          <MembersView users={users} onMemberAdded={loadData} />
        )}
      </main>

      {/* MODALS */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onCardCreated={loadData}
        users={users}
      />

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onExpenseCreated={loadData}
        cards={cards}
        categories={categories}
        users={users}
        defaultCardId={selectedCardId}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentCreated={loadData}
        cards={cards}
        users={users}
        defaultCardId={selectedCardId}
      />
    </div>
  );
};

