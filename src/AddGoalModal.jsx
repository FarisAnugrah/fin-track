import React, { useState } from 'react';
import { useStore } from './store';
import { Plane, Car, Home, GraduationCap, Heart, Laptop, CircleDollarSign, Baby } from 'lucide-react';

const ICONS = [
  { id: 'home', component: Home },
  { id: 'car', component: Car },
  { id: 'plane', component: Plane },
  { id: 'grad', component: GraduationCap },
  { id: 'heart', component: Heart },
  { id: 'laptop', component: Laptop },
  { id: 'baby', component: Baby },
  { id: 'money', component: CircleDollarSign },
];

export default function AddGoalModal({ onClose }) {
  const { addGoal } = useStore();
  const [form, setForm] = useState({
    name: '',
    currentCost: '',
    years: '',
    inflationRate: '0.04', // Default 4%
    icon: 'home'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.currentCost || !form.years) return;
    
    addGoal({
      name: form.name,
      currentCost: Number(form.currentCost),
      years: Number(form.years),
      inflationRate: Number(form.inflationRate),
      icon: form.icon
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-xl font-extrabold text-[#0F172A] mb-6">Add SMART Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {ICONS.map(iconObj => {
                const IconComp = iconObj.component;
                const isSelected = form.icon === iconObj.id;
                return (
                  <button
                    key={iconObj.id}
                    type="button"
                    onClick={() => setForm({...form, icon: iconObj.id})}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-[#10B981] text-white shadow-md shadow-emerald-200 border-2 border-[#10B981]' : 'bg-gray-50 text-gray-400 border-2 border-transparent hover:border-gray-200 hover:text-gray-600'}`}
                  >
                    <IconComp className="w-6 h-6" />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Goal Name</label>
              <input 
                type="text" 
                placeholder="e.g. Wedding, Car" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#10B981] focus:ring-0 outline-none font-medium" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current Cost (Rp)</label>
              <input 
                type="number" 
                placeholder="e.g. 100000000" 
                value={form.currentCost} 
                onChange={e => setForm({...form, currentCost: e.target.value})} 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#10B981] focus:ring-0 outline-none font-medium" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target (Years)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5" 
                  value={form.years} 
                  onChange={e => setForm({...form, years: e.target.value})} 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#10B981] focus:ring-0 outline-none font-medium" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Inflation/Yr</label>
                <select 
                  value={form.inflationRate} 
                  onChange={e => setForm({...form, inflationRate: e.target.value})} 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#10B981] focus:ring-0 outline-none font-medium"
                >
                <option value="0.02">2% (Low)</option>
                <option value="0.04">4% (Medium)</option>
                <option value="0.07">7% (High)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-8 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-3 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-3 font-semibold bg-[#10B981] text-white rounded-xl hover:bg-[#15B065] transition-colors shadow-md shadow-emerald-200">Calculate & Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
