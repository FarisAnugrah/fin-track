import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Target, Activity, Plus, Home, Coffee, LogOut, Settings, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { hasOnboarded, income, setIncome, getBudget, getSpent, goals, calculateGoal, addTransaction, transactions, removeTransaction, removeGoal } = useStore();
  
  // Initialize from hash or default to dashboard
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['dashboard', 'cashflow', 'goals', 'settings'].includes(hash) ? hash : 'dashboard';
  });

  // Sync state to URL hash
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Sync URL hash changes (back/forward buttons) to state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'cashflow', 'goals', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!hasOnboarded) {
    return <Onboarding />;
  }

  // Monthly Filter State
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Helper to change month
  const changeMonth = (offset) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  // Format month year for display
  const monthDisplay = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(tx => {
    // If transaction doesn't have a date, assume it belongs to the month it was created
    // But since we can't know, we'll assign it to the current month to avoid data loss
    if (!tx.date) return true; 
    
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  // Calculate spent based ONLY on current month's transactions
  const currentSpent = currentMonthTransactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, { needs: 0, wants: 0, goals: 0 });

  const budget = getBudget();
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const [txForm, setTxForm] = useState({ amount: '', category: 'needs', desc: '' });
  const [incomeForm, setIncomeForm] = useState(income.toString());
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);

  const filteredTransactions = currentMonthTransactions.filter(tx => {
    const matchesSearch = tx.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!txForm.amount) return;
    
    // Create transaction using the currently selected month in the UI
    addTransaction({ 
      ...txForm, 
      amount: Number(txForm.amount),
      date: currentDate.toISOString() // This binds the transaction to the month currently being viewed
    });
    
    setShowAddTx(false);
    setTxForm({ amount: '', category: 'needs', desc: '' });
  };

  const handleUpdateIncome = (e) => {
    e.preventDefault();
    if (!incomeForm || Number(incomeForm) <= 0) return;
    setIncome(Number(incomeForm));
    alert('Income updated successfully!');
  };

  const renderNav = (isMobile) => {
    const btnClass = (tab) => `flex ${isMobile ? 'flex-col items-center flex-1' : 'items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200'} ${activeTab === tab ? (isMobile ? 'text-[#10B981]' : 'bg-[#F8FAFC] text-[#10B981]') : (isMobile ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')}`;
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
        <button onClick={() => setActiveTab('settings')} className={btnClass('settings')}>
          <Settings className={isMobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
          <span className={isMobile ? "text-[10px] font-medium" : ""}>Settings</span>
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-gray-900 pb-20 md:pb-0">
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 px-6 py-8 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
             <Target className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">FinTrack</h1>
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
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              {activeTab === 'dashboard' ? 'Budget Overview' : activeTab === 'goals' ? 'SMART Goals' : activeTab === 'cashflow' ? 'Cashflow' : 'Settings'}
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              {activeTab === 'dashboard' ? 'Track your 50/30/20 budget limits.' : activeTab === 'goals' ? 'Inflation-adjusted financial targets.' : activeTab === 'cashflow' ? 'Your recent transactions.' : 'Manage your preferences.'}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            {(activeTab === 'dashboard' || activeTab === 'cashflow') && (
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <button onClick={() => changeMonth(-1)} className="p-2 text-gray-400 hover:text-[#0F172A] hover:bg-gray-50 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 font-bold text-sm text-[#0F172A] w-36 text-center">{monthDisplay}</span>
                <button onClick={() => changeMonth(1)} className="p-2 text-gray-400 hover:text-[#0F172A] hover:bg-gray-50 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {activeTab !== 'goals' && activeTab !== 'settings' && (
              <button onClick={() => setShowAddTx(true)} className="flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-gray-200 transition-transform active:scale-95 h-[46px]">
                <Plus className="w-5 h-5" /> Add Transaction
              </button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8 mb-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray={`${(currentSpent.needs / income) * 251.2} 251.2`} />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray={`${(currentSpent.wants / income) * 251.2} 251.2`} strokeDashoffset={-(currentSpent.needs / income) * 251.2} />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#D946EF" strokeWidth="12" strokeDasharray={`${(currentSpent.goals / income) * 251.2} 251.2`} strokeDashoffset={-((currentSpent.needs + currentSpent.wants) / income) * 251.2} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Spent</span>
                  <span className="text-xl font-black text-[#0F172A] mt-1">{formatCurrency(currentSpent.needs + currentSpent.wants + currentSpent.goals)}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-[#0F172A] mb-4">Cashflow Summary</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">
                  You have spent <strong className="text-[#0F172A]">{(((currentSpent.needs + currentSpent.wants + currentSpent.goals) / income) * 100).toFixed(1)}%</strong> of your {formatCurrency(income)} monthly income.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] shadow-sm"></div>
                    <span className="text-sm font-bold text-gray-600">Needs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm"></div>
                    <span className="text-sm font-bold text-gray-600">Wants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D946EF] shadow-sm"></div>
                    <span className="text-sm font-bold text-gray-600">Goals</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {[
              { id: 'needs', label: 'Needs (50%)', icon: Home, bg: 'bg-[#EFF6FF]', bar: 'bg-[#3B82F6]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]' },
              { id: 'wants', label: 'Wants (30%)', icon: Coffee, bg: 'bg-[#FFFBEB]', bar: 'bg-[#F59E0B]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
              { id: 'goals', label: 'Goals (20%)', icon: Target, bg: 'bg-[#FDF4FF]', bar: 'bg-[#D946EF]', text: 'text-[#C026D3]', border: 'border-[#F5D0FE]' }
            ].map(cat => {
              const Icon = cat.icon;
              const limit = budget[cat.id];
              const used = currentSpent[cat.id];
              const pct = Math.min((used / limit) * 100, 100) || 0;
              
              return (
                <div key={cat.id} className={`bg-white p-7 rounded-[2rem] border-2 ${cat.border} shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.bg} ${cat.text} shadow-sm`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-xs font-extrabold uppercase tracking-widest ${cat.text} px-3 py-1 rounded-full ${cat.bg}`}>{cat.label}</span>
                  </div>
                  
                  <div className="text-3xl font-black text-[#0F172A] mt-2">{formatCurrency(limit - used)}</div>
                  <div className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">Left to spend</div>
                  
                  <div className={`mt-8 w-full ${cat.bg} rounded-full h-3 overflow-hidden shadow-inner border ${cat.border}`}>
                    <div className={`${cat.bar} h-3 rounded-full transition-all duration-500 ease-out`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs font-bold text-gray-500">{pct.toFixed(0)}% Spent</p>
                    <p className="text-xs font-bold text-gray-400">of {formatCurrency(limit)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}

        {activeTab === 'goals' && (
          <section className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-extrabold text-[#0F172A]">Active Goals</h3>
              <button onClick={() => setShowAddGoal(true)} className="text-sm bg-[#F8FAFC] text-[#0F172A] px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                + New Goal
              </button>
            </div>
            
            {goals.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-[1.5rem]">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🎯</div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">No active goals</h4>
                <p className="text-gray-500 font-medium text-sm max-w-sm mx-auto">Set a financial target like buying a house or a car, and we'll help you calculate the inflation-adjusted cost.</p>
                <button onClick={() => setShowAddGoal(true)} className="mt-6 text-sm bg-[#10B981] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#15B065] shadow-lg shadow-emerald-200/50 transition-colors inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create First Goal
                </button>
              </div>
          ) : (
              <div className="space-y-4">
                {goals.map(g => {
                  const calc = calculateGoal(g);
                  return (
                    <div key={g.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors gap-4 relative">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl border border-gray-100 flex-shrink-0">
                          {g.icon || '🎯'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{g.name}</h4>
                          <p className="text-sm text-gray-500 font-medium">In {g.years * 12} months ({g.inflationRate*100}% inflation) → {formatCurrency(calc.futureCost)}</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right md:pr-10">
                        <div className="font-extrabold text-[#0F172A] text-lg">{formatCurrency(calc.monthlyRequired)} <span className="text-sm font-medium text-gray-400">/ mo</span></div>
                        {calc.isAchievable ? (
                          <div className="text-xs text-[#10B981] font-bold mt-1 bg-green-50 inline-block px-3 py-1 rounded-lg">Achievable</div>
                        ) : (
                          <div className="text-xs text-red-600 font-bold mt-1 bg-red-50 inline-block px-3 py-1 rounded-lg">
                            Requires {formatCurrency(calc.monthlyRequired - (income*0.2))} more/mo or +{calc.monthsToPush} months
                          </div>
                        )}
                      </div>
                      <button onClick={() => {
                        if(window.confirm(`Delete goal "${g.name}"?`)) removeGoal(g.id);
                      }} className="absolute top-4 right-4 md:top-1/2 md:-translate-y-1/2 p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'cashflow' && (
          <section className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-extrabold text-[#0F172A]">Recent Transactions</h3>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2 rounded-xl focus:border-[#10B981] focus:bg-white focus:ring-0 outline-none font-medium text-sm transition-colors"
                  />
                </div>
                <div className="relative flex-shrink-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 pl-10 pr-8 py-2 rounded-xl focus:border-[#10B981] focus:bg-white focus:ring-0 outline-none font-medium text-sm transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="needs">Needs</option>
                    <option value="wants">Wants</option>
                    <option value="goals">Goals</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Activity className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-2">Clean slate</h4>
                <p className="text-gray-500 font-medium text-base max-w-sm mx-auto">
                  {currentMonthTransactions.length === 0 ? `You haven't spent any money in ${monthDisplay}. Click the Add Transaction button to log your first expense.` : "No transactions match your search."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.slice().reverse().map(tx => (
                  <div key={tx.id} onClick={() => setSelectedTx(tx)} className="flex items-center justify-between p-5 rounded-[1.5rem] border-2 border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-white transition-all hover:-translate-y-0.5 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                        tx.category === 'needs' ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]' : 
                        tx.category === 'wants' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' : 
                        'bg-[#FDF4FF] text-[#C026D3] border border-[#F5D0FE]'
                      }`}>
                        {tx.category === 'needs' ? <Home className="w-6 h-6" /> : tx.category === 'wants' ? <Coffee className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 capitalize text-lg">{tx.desc}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tx.category}</p>
                          {tx.date && (
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-xs font-medium text-gray-400">
                                {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-black text-[#0F172A] text-xl">
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8 max-w-2xl">
            <h3 className="text-xl font-extrabold text-[#0F172A] mb-8">Update Income</h3>
            <form onSubmit={handleUpdateIncome} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Income (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                  <input type="number" value={incomeForm} onChange={e => setIncomeForm(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 pl-12 pr-4 py-3.5 rounded-xl focus:border-[#10B981] focus:bg-white focus:ring-0 outline-none font-extrabold text-[#0F172A] text-lg transition-colors" required />
                </div>
              </div>
              <button type="submit" className="px-6 py-3.5 font-bold bg-[#10B981] text-white rounded-xl hover:bg-[#15B065] transition-all shadow-lg shadow-emerald-200 active:scale-95">
                Save Changes
              </button>
            </form>
          </section>
        )}
      </main>

      {showAddTx && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100">
            <h3 className="text-xl font-extrabold mb-6 text-[#0F172A]">Add Transaction</h3>
            <form onSubmit={handleAddTx} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                  <input type="number" placeholder="0" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 pl-12 pr-4 py-3.5 rounded-xl focus:border-[#10B981] focus:bg-white focus:ring-0 outline-none font-extrabold text-[#0F172A] text-lg transition-colors" required />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <input type="text" placeholder="e.g. Lunch, Rent" value={txForm.desc} onChange={e => setTxForm({...txForm, desc: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl focus:border-[#10B981] focus:bg-white focus:ring-0 outline-none font-bold text-[#0F172A] transition-colors" required />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl focus:border-[#10B981] focus:bg-white focus:ring-0 outline-none font-bold text-[#0F172A] transition-colors appearance-none cursor-pointer">
                  <option value="needs">Needs (Essential)</option>
                  <option value="wants">Wants (Lifestyle)</option>
                  <option value="goals">Goals (Savings)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-2">
                <button type="button" onClick={() => setShowAddTx(false)} className="px-5 py-3.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors w-full">Cancel</button>
                <button type="submit" className="px-5 py-3.5 font-bold bg-[#10B981] text-white rounded-xl hover:bg-[#15B065] transition-all shadow-lg shadow-emerald-200 w-full active:scale-95">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddGoal && <AddGoalModal onClose={() => setShowAddGoal(false)} />}

      {selectedTx && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50 transition-all" onClick={() => setSelectedTx(null)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 mb-20 md:mb-0" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                selectedTx.category === 'needs' ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]' : 
                selectedTx.category === 'wants' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' : 
                'bg-[#FDF4FF] text-[#C026D3] border border-[#F5D0FE]'
              }`}>
                {selectedTx.category === 'needs' ? <Home className="w-8 h-8" /> : selectedTx.category === 'wants' ? <Coffee className="w-8 h-8" /> : <Target className="w-8 h-8" />}
              </div>
              <button onClick={() => {
                if(window.confirm(`Delete transaction "${selectedTx.desc}"?`)) {
                  removeTransaction(selectedTx.id);
                  setSelectedTx(null);
                }
              }} className="p-3 text-red-500 bg-red-50 hover:bg-red-100 transition-colors rounded-xl flex items-center gap-2 font-bold text-sm">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
            
            <div className="mb-8">
              <h3 className="text-3xl font-black text-[#0F172A] mb-1">{formatCurrency(selectedTx.amount)}</h3>
              <p className="text-gray-500 font-medium capitalize text-lg">{selectedTx.desc}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-400 font-bold text-sm">Category</span>
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-sm">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-400 font-bold text-sm">Date</span>
                <span className="font-bold text-[#0F172A] text-sm">
                  {selectedTx.date ? new Date(selectedTx.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-400 font-bold text-sm">Time</span>
                <span className="font-bold text-[#0F172A] text-sm">
                  {selectedTx.date ? new Date(selectedTx.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' }) : '--:--'}
                </span>
              </div>
            </div>

            <button onClick={() => setSelectedTx(null)} className="w-full py-4 font-bold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
              Close Details
            </button>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {renderNav(true)}
      </nav>
    </div>
  );
}
