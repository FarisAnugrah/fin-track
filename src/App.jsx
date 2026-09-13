import React, { useState } from 'react';
import { LayoutDashboard, Target, Activity, Plus, Home, Coffee } from 'lucide-react';
import { useStore } from './store';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function App() {
  const { income, getBudget, getSpent, goals, calculateGoal, addTransaction } = useStore();
  const budget = getBudget();
  const spent = getSpent();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddTx, setShowAddTx] = useState(false);

  const [txForm, setTxForm] = useState({ amount: '', category: 'needs', desc: '' });

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!txForm.amount) return;
    addTransaction({ ...txForm, amount: Number(txForm.amount) });
    setShowAddTx(false);
    setTxForm({ amount: '', category: 'needs', desc: '' });
  };

  const renderNav = (isMobile) => {
    const btnClass = (tab) => `flex ${isMobile ? 'flex-col items-center' : 'items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors'} ${activeTab === tab ? (isMobile ? 'text-indigo-600' : 'bg-indigo-50 text-indigo-700') : (isMobile ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}`;
    return (
      <>
        <button onClick={() => setActiveTab('dashboard')} className={btnClass('dashboard')}>
          <LayoutDashboard className={isMobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
          <span className={isMobile ? "text-[10px] font-medium" : ""}>Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('goals')} className={btnClass('goals')}>
          <Target className={isMobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
          <span className={isMobile ? "text-[10px] font-medium" : ""}>Goals</span>
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans text-gray-900 pb-20 md:pb-0">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 px-6 py-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <Target className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Reeach</h1>
        </div>
        <nav className="flex-1 space-y-2">{renderNav(false)}</nav>
      </aside>

      <main className="flex-1 px-4 md:px-12 py-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{activeTab === 'dashboard' ? 'Overview' : 'SMART Goals'}</h2>
          </div>
          <button onClick={() => setShowAddTx(true)} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { id: 'needs', label: 'Needs (50%)', icon: Home, bg: 'bg-emerald-500' },
              { id: 'wants', label: 'Wants (30%)', icon: Coffee, bg: 'bg-amber-400' },
              { id: 'goals', label: 'Goals (20%)', icon: Target, bg: 'bg-white', isDark: true }
            ].map(cat => {
              const Icon = cat.icon;
              const limit = budget[cat.id];
              const used = spent[cat.id];
              const pct = Math.min((used / limit) * 100, 100) || 0;
              
              return (
                <div key={cat.id} className={`${cat.isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'} p-6 rounded-2xl flex flex-col justify-between`}>
                  <div className={`flex items-center gap-2 ${cat.isDark ? 'text-indigo-100' : 'text-gray-500'} mb-4`}>
                    <Icon className="w-4 h-4" /> <span className="text-sm font-medium uppercase tracking-wider">{cat.label}</span>
                  </div>
                  <div className="text-3xl font-semibold">{formatCurrency(limit - used)} <span className="text-sm font-normal opacity-70">left</span></div>
                  <div className={`mt-4 w-full ${cat.isDark ? 'bg-indigo-500/50' : 'bg-gray-100'} rounded-full h-1.5`}>
                    <div className={`${cat.bg} h-1.5 rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className={`text-xs ${cat.isDark ? 'text-indigo-200' : 'text-gray-400'} mt-2`}>{pct.toFixed(0)}% spent</p>
                </div>
              );
            })}
          </div>
        )}

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Goals</h3>
          <div className="space-y-4">
            {goals.map(g => {
              const calc = calculateGoal(g);
              return (
                <div key={g.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-100 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{g.name}</h4>
                    <p className="text-sm text-gray-500">In {g.years * 12} months (4% inflation) → {formatCurrency(calc.futureCost)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(calc.monthlyRequired)} / mo</div>
                    {calc.isAchievable ? (
                      <div className="text-xs text-emerald-600 font-medium mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded">Achievable</div>
                    ) : (
                      <div className="text-xs text-red-600 font-medium mt-1 bg-red-50 inline-block px-2 py-0.5 rounded">
                        Requires {formatCurrency(calc.monthlyRequired - (income*0.2))} more/mo or +{calc.monthsToPush} months
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {showAddTx && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Add Transaction</h3>
            <form onSubmit={handleAddTx} className="space-y-4">
              <input type="number" placeholder="Amount" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} className="w-full border p-2 rounded-lg" required />
              <input type="text" placeholder="Description" value={txForm.desc} onChange={e => setTxForm({...txForm, desc: e.target.value})} className="w-full border p-2 rounded-lg" required />
              <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})} className="w-full border p-2 rounded-lg">
                <option value="needs">Needs</option>
                <option value="wants">Wants</option>
                <option value="goals">Goals</option>
              </select>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowAddTx(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-40">
        {renderNav(true)}
      </nav>
    </div>
  );
}
