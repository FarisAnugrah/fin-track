import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      income: 0,
      setIncome: (income) => set({ income, hasOnboarded: true }),
      
      transactions: [],
      addTransaction: (tx) => set((state) => ({ 
        // If tx already has a date from the UI (like historical input), use it, otherwise fallback to now
        transactions: [...state.transactions, { ...tx, id: Date.now().toString(), date: tx.date || new Date().toISOString() }] 
      })),
      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      goals: [
        {
          id: '1',
          name: 'House Downpayment',
          currentCost: 100000000,
          years: 2,
          inflationRate: 0.04,
          icon: '🎯'
        }
      ],
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: Date.now().toString() }]
      })),
      removeGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      getBudget: () => {
        const { income } = get();
        return {
          needs: income * 0.5,
          wants: income * 0.3,
          goals: income * 0.2,
        };
      },

      getSpent: () => {
        const { transactions } = get();
        return transactions.reduce((acc, tx) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        }, { needs: 0, wants: 0, goals: 0 });
      },

      calculateGoal: (goal) => {
        const { income } = get();
        const futureCost = goal.currentCost * Math.pow(1 + goal.inflationRate, goal.years);
        const monthlyRequired = futureCost / (goal.years * 12);
        const monthlyAvailable = income * 0.2; 

        return {
          futureCost,
          monthlyRequired,
          isAchievable: monthlyRequired <= monthlyAvailable,
          monthsToPush: Math.ceil(futureCost / monthlyAvailable) - (goal.years * 12)
        };
      }
    }),
    {
      name: 'fintrack-storage', 
    }
  )
);
