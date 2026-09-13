import React, { useState } from 'react';
import { useStore } from './store';

export default function AddGoalModal({ onClose }) {
  const { addGoal } = useStore();
  const [form, setForm] = useState({
    name: '',
    currentCost: '',
    years: '',
    inflationRate: '0.04', // Default 4%
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.currentCost || !form.years) return;
    
    addGoal({
      name: form.name,
      currentCost: Number(form.currentCost),
      years: Number(form.years),
      inflationRate: Number(form.inflationRate),
      icon: '🎯'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold mb-4">Add SMART Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input 
              type="text" 
              placeholder="e.g. Wedding, Car" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Cost (Rp)</label>
            <input 
              type="number" 
              placeholder="e.g. 100000000" 
              value={form.currentCost} 
              onChange={e => setForm({...form, currentCost: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target (Years)</label>
              <input 
                type="number" 
                placeholder="e.g. 5" 
                value={form.years} 
                onChange={e => setForm({...form, years: e.target.value})} 
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inflation/Yr</label>
              <select 
                value={form.inflationRate} 
                onChange={e => setForm({...form, inflationRate: e.target.value})} 
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="0.02">2% (Low)</option>
                <option value="0.04">4% (Medium)</option>
                <option value="0.07">7% (High)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Calculate & Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
