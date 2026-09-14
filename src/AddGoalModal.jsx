import React, { useState, useMemo } from 'react';
import { useStore } from './store';
import { Plane, Car, Home, GraduationCap, Heart, Laptop, CircleDollarSign, Baby, Camera, Music, BookOpen, Coffee, Dumbbell, Gamepad2, Gift, Gem, ShoppingBag, Palmtree, Search } from 'lucide-react';

const ICONS = [
  { id: 'home', tags: ['house', 'home', 'property', 'mortgage', 'rent'], component: Home },
  { id: 'car', tags: ['car', 'vehicle', 'auto', 'driving'], component: Car },
  { id: 'plane', tags: ['travel', 'flight', 'holiday', 'vacation', 'trip'], component: Plane },
  { id: 'grad', tags: ['education', 'school', 'university', 'college', 'degree'], component: GraduationCap },
  { id: 'heart', tags: ['health', 'medical', 'wedding', 'love', 'care'], component: Heart },
  { id: 'laptop', tags: ['tech', 'computer', 'laptop', 'mac', 'gadget'], component: Laptop },
  { id: 'baby', tags: ['child', 'baby', 'kid', 'family'], component: Baby },
  { id: 'money', tags: ['saving', 'invest', 'money', 'cash', 'fund'], component: CircleDollarSign },
  { id: 'camera', tags: ['photo', 'camera', 'hobby', 'lens'], component: Camera },
  { id: 'music', tags: ['music', 'concert', 'instrument', 'guitar'], component: Music },
  { id: 'book', tags: ['book', 'course', 'learning'], component: BookOpen },
  { id: 'coffee', tags: ['cafe', 'coffee', 'business', 'shop'], component: Coffee },
  { id: 'gym', tags: ['gym', 'fitness', 'sport', 'health'], component: Dumbbell },
  { id: 'game', tags: ['gaming', 'console', 'ps5', 'pc', 'game'], component: Gamepad2 },
  { id: 'gift', tags: ['gift', 'present', 'birthday', 'charity'], component: Gift },
  { id: 'gem', tags: ['ring', 'jewelry', 'wedding', 'luxury'], component: Gem },
  { id: 'shop', tags: ['shopping', 'clothes', 'fashion'], component: ShoppingBag },
  { id: 'beach', tags: ['beach', 'holiday', 'summer', 'island'], component: Palmtree },
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
  
  const [searchIcon, setSearchIcon] = useState('');

  const filteredIcons = useMemo(() => {
    if (!searchIcon.trim()) return ICONS;
    const term = searchIcon.toLowerCase();
    return ICONS.filter(i => 
      i.id.includes(term) || i.tags.some(tag => tag.includes(term))
    );
  }, [searchIcon]);

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
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] transition-all overflow-y-auto">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100 my-8">
        <h3 className="text-2xl font-extrabold text-[#0F172A] mb-8">Add SMART Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Goal Icon</label>
            <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search icons (e.g. 'wedding', 'travel')" 
                  value={searchIcon}
                  onChange={(e) => setSearchIcon(e.target.value)}
                  className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-xl focus:border-[#10B981] focus:ring-0 outline-none text-sm transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 pb-2">
                {filteredIcons.length > 0 ? filteredIcons.map(iconObj => {
                  const IconComp = iconObj.component;
                  const isSelected = form.icon === iconObj.id;
                  return (
                    <button
                      key={iconObj.id}
                      type="button"
                      onClick={() => setForm({...form, icon: iconObj.id})}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-[#10B981] text-white shadow-md shadow-emerald-200 border-2 border-[#10B981] scale-110' : 'bg-white text-gray-400 border-2 border-transparent hover:border-gray-200 hover:text-gray-600'}`}
                      title={iconObj.tags.join(', ')}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  )
                }) : (
                  <p className="text-sm text-gray-400 text-center w-full py-4">No icons found. Try another keyword.</p>
                )}
              </div>
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
