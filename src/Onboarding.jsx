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
      <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-xl shadow-gray-200/50 text-center">
        <div className="w-20 h-20 bg-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200">
          <Target className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-extrabold mb-3 text-[#0F172A]">Welcome to FinTrack</h1>
        <p className="text-gray-500 mb-10 font-medium">To build your 50/30/20 budget and SMART goals, let's start with your monthly income.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">Rp</span>
            <input 
              type="number" 
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder="e.g. 15000000" 
              className="w-full bg-gray-50 border-2 border-gray-100 pl-14 pr-4 py-4 rounded-2xl focus:border-[#10B981] focus:bg-white outline-none text-xl font-bold text-[#0F172A] transition-all"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-[#10B981] hover:bg-[#15B065] text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200/50 transition-all active:scale-[0.98] text-lg"
          >
            Start Budgeting
          </button>
        </form>
      </div>
    </div>
  );
}
