import React, { useState } from 'react';
import { useStore } from './store';
import { Target } from 'lucide-react';

export default function Onboarding() {
  const { setIncome } = useStore();
  const [val, setVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!val || Number(val) <= 0) return;
    setIncome(Number(val));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
          <Target className="text-white w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Welcome to Reeach</h1>
        <p className="text-gray-500 mb-8 text-sm">To build your 50/30/20 budget and SMART goals, let's start with your monthly income.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
            <input 
              type="number" 
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder="e.g. 15000000" 
              className="w-full border-2 border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:border-indigo-600 focus:ring-0 outline-none text-lg font-medium transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            Start Budgeting
          </button>
        </form>
      </div>
    </div>
  );
}
