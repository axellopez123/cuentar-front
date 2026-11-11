import React from 'react';
import { CreditCard, Wallet, Users, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'cards' | 'transactions' | 'members';
  setActiveTab: (tab: 'dashboard' | 'cards' | 'transactions' | 'members') => void;
  onOpenExpenseModal: () => void;
  onOpenPaymentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExpenseModal,
  onOpenPaymentModal,
}) => {
  const { user, logout } = useAuth();

  const roleLabel = {
    primary: 'Principal',
    partner: 'Pareja',
    member: 'Miembro',
  }[user?.role || 'member'];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Cuentar
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'cards'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Cuentas y Tarjetas
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Transacciones
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'members'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Hogar & Miembros
              </button>
            </nav>
          </div>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPaymentModal}
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              + Registrar Abono / Pago
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/25 transition-all"
            >
              + Registrar Gasto
            </button>

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.full_name}</div>
                  <div className="text-[11px] font-medium text-blue-600">{roleLabel}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

