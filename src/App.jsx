import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Target, Activity, Plus, Home, Coffee, LogOut } from 'lucide-react';
import { useStore } from './store';
import AddGoalModal from './AddGoalModal';
import Onboarding from './Onboarding';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function App() {
  const { hasOnboarded, income, getBudget, getSpent, goals, calculateGoal, addTransaction, transactions } = useStore();
  
  // Initialize from hash or default to dashboard
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['dashboard', 'cashflow', 'goals'].includes(hash) ? hash : 'dashboard';
  });

  // Sync state to URL hash
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Sync URL hash changes (back/forward buttons) to state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'cashflow', 'goals'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!hasOnboarded) {
    return <Onboarding />;
  }

  const budget = getBudget();
  const spent = getSpent();
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const [txForm, setTxForm] = useState({ amount: '', category: 'needs', desc: '' });

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!txForm.amount) return;
    addTransaction({ ...txForm, amount: Number(txForm.amount) });
    setShowAddTx(false);
    setTxForm({ amount: '', category: 'needs', desc: '' });
  };

  const renderNav = (isMobile) => {
    const btnClass = (tab) => `flex ${isMobile ? 'flex-col items-center flex-1' : 'items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200'} ${activeTab === tab ? (isMobile ? 'text-spendee-green' : 'bg-spendee-green text-white shadow-md shadow-emerald-200/50') : (isMobile ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')}`;
    return (
      <>
        <button onClick={() => setActiveTab('dashboard')} className={btnClass('dashboard')}>
          <LayoutDashboard className={isMobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
          <span className={isMobile ? "text-[10px] font-medium" : ""}>Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('cashflow')} className={btnClass('cashflow')}>
          <Activity className={isMobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
          <span className={isMobile ? "text-[10px] font-medium" : ""}>Cashflow</span>
        </button>
        <button onClick={() => setActiveTab('goals')} className={btnClass('goals')}>
          <Target className={isMobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
          <span className={isMobile ? "text-[10px] font-medium" : ""}>Goals</span>
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-spendee-light flex flex-col md:flex-row font-sans text-gray-900 pb-20 md:pb-0">
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 px-6 py-8 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-10 h-10 bg-spendee-dark rounded-xl flex items-center justify-center shadow-lg">
             <Target className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-spendee-dark">FinTrack</h1>
        </div>
        <nav className="flex-1 space-y-2">{renderNav(false)}</nav>
        <div className="pt-8 border-t border-gray-100 mt-auto">
          <button onClick={() => {
            if(window.confirm('Are you sure you want to reset all your data?')) {
              localStorage.removeItem('fintrack-storage');
              window.location.reload();
            }
          }} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl w-full text-left transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Reset Data
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 md:px-12 py-8 overflow-y-auto w-full max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 mt-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-spendee-dark">
              {activeTab === 'dashboard' ? 'Budget Overview' : activeTab === 'goals' ? 'SMART Goals' : 'Cashflow'}
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              {activeTab === 'dashboard' ? 'Track your 50/30/20 budget limits.' : activeTab === 'goals' ? 'Inflation-adjusted financial targets.' : 'Your recent transactions.'}
            </p>
          </div>
          {activeTab !== 'goals' && (
            <button onClick={() => setShowAddTx(true)} className="flex items-center justify-center gap-2 bg-spendee-green hover:bg-[#15B065] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200/50 transition-transform active:scale-95">
              <Plus className="w-5 h-5" /> Add Transaction
            </button>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {[
              { id: 'needs', label: 'Needs (50%)', icon: Home, bg: 'bg-blue-500' },
              { id: 'wants', label: 'Wants (30%)', icon: Coffee, bg: 'bg-amber-400' },
              { id: 'goals', label: 'Goals (20%)', icon: Target, bg: 'bg-spendee-green' }
            ].map(cat => {
              const Icon = cat.icon;
              const limit = budget[cat.id];
              const used = spent[cat.id];
              const pct = Math.min((used / limit) * 100, 100) || 0;
              
              return (
                <div key={cat.id} className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      cat.id === 'needs' ? 'bg-blue-100 text-blue-500' :
                      cat.id === 'wants' ? 'bg-amber-100 text-amber-500' :
                      'bg-emerald-100 text-spendee-green'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{cat.label}</span>
                  </div>
                  
                  <div className="text-3xl font-extrabold text-spendee-dark">{formatCurrency(limit - used)}</div>
                  <div className="text-sm font-medium text-gray-500 mt-1">left to spend</div>
                  
                    <div className="mt-6 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`${cat.bg} h-2 rounded-full transition-all duration-500 ease-out`} style={{ width: `${pct}%` }}></div>
                    </div>
                  <p className="text-sm font-medium text-gray-400 mt-3">{pct.toFixed(0)}% spent of {formatCurrency(limit)}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'goals' && (
          <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-spendee-dark">Active Goals</h3>
              <button onClick={() => setShowAddGoal(true)} className="text-sm bg-spendee-light text-spendee-dark px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                + New Goal
              </button>
            </div>
            <div className="space-y-4">
              {goals.map(g => {
                const calc = calculateGoal(g);
                return (
                  <div key={g.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl border border-gray-100">
                        {g.icon || '🎯'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{g.name}</h4>
                        <p className="text-sm text-gray-500 font-medium">In {g.years * 12} months ({g.inflationRate*100}% inflation) → {formatCurrency(calc.futureCost)}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="font-extrabold text-spendee-dark text-lg">{formatCurrency(calc.monthlyRequired)} <span className="text-sm font-medium text-gray-400">/ mo</span></div>
                      {calc.isAchievable ? (
                        <div className="text-xs text-spendee-green font-bold mt-1 bg-green-50 inline-block px-3 py-1 rounded-lg">Achievable</div>
                      ) : (
                        <div className="text-xs text-red-600 font-bold mt-1 bg-red-50 inline-block px-3 py-1 rounded-lg">
                          Requires {formatCurrency(calc.monthlyRequired - (income*0.2))} more/mo or +{calc.monthsToPush} months
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {activeTab === 'cashflow' && (
          <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-spendee-dark mb-6">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-400 font-medium text-center py-12">No transactions yet. Click 'Add Transaction' to start tracking.</p>
            ) : (
              <div className="space-y-4">
                {transactions.slice().reverse().map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.category === 'needs' ? 'bg-blue-100 text-blue-600' : tx.category === 'wants' ? 'bg-amber-100 text-amber-600' : 'bg-spendee-green bg-opacity-20 text-spendee-green'}`}>
                        {tx.category === 'needs' ? <Home className="w-6 h-6" /> : tx.category === 'wants' ? <Coffee className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 capitalize text-lg">{tx.desc}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{tx.category}</p>
                      </div>
                    </div>
                    <div className="font-extrabold text-gray-900 text-lg">
                      -{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {showAddTx && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-extrabold mb-6 text-spendee-dark">Add Transaction</h3>
            <form onSubmit={handleAddTx} className="space-y-4">
              <input type="number" placeholder="Amount" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-spendee-green focus:ring-0 outline-none font-medium" required />
              <input type="text" placeholder="Description" value={txForm.desc} onChange={e => setTxForm({...txForm, desc: e.target.value})} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-spendee-green focus:ring-0 outline-none font-medium" required />
              <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-spendee-green focus:ring-0 outline-none font-medium">
                <option value="needs">Needs</option>
                <option value="wants">Wants</option>
                <option value="goals">Goals</option>
              </select>
              <div className="flex gap-3 justify-end mt-8">
                <button type="button" onClick={() => setShowAddTx(false)} className="px-5 py-3 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-3 font-semibold bg-spendee-green text-white rounded-xl hover:bg-[#15B065] transition-colors shadow-md shadow-emerald-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddGoal && <AddGoalModal onClose={() => setShowAddGoal(false)} />}

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {renderNav(true)}
      </nav>
    </div>
  );
}
