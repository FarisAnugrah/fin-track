import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate realistic date for dummy data (within current month)
const getRealisticDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const useStore = create(
  persist(
    (set, get) => ({
      hasOnboarded: true, // Auto-onboard for dummy data
      income: 4500000, // Typical student allowance/part-time income
      setIncome: (income) => set({ income, hasOnboarded: true }),
      
      transactions: [
        // Needs (Kos essentials)
        { id: 't1', amount: 1500000, category: 'needs', desc: 'Kos Rent (Monthly)', date: getRealisticDate(12) },
        { id: 't2', amount: 150000, category: 'needs', desc: 'Kos Electricity Token', date: getRealisticDate(10) },
        { id: 't3', amount: 350000, category: 'needs', desc: 'Indomaret Groceries & Water', date: getRealisticDate(8) },
        { id: 't4', amount: 120000, category: 'needs', desc: 'Cellular Data Package', date: getRealisticDate(7) },
        { id: 't5', amount: 200000, category: 'needs', desc: 'Gojek to Campus', date: getRealisticDate(5) },
        // Wants (Student lifestyle)
        { id: 't6', amount: 55000, category: 'wants', desc: 'Spotify Student Plan', date: getRealisticDate(15) },
        { id: 't7', amount: 125000, category: 'wants', desc: 'Mixue & Seblak with friends', date: getRealisticDate(11) },
        { id: 't8', amount: 180000, category: 'wants', desc: 'Nugas at Coffee Shop', date: getRealisticDate(9) },
        { id: 't9', amount: 250000, category: 'wants', desc: 'Thrifting at Pasar Senen', date: getRealisticDate(4) },
        { id: 't10', amount: 85000, category: 'wants', desc: 'Valorant Points', date: getRealisticDate(2) },
        // Goals (Savings)
        { id: 't11', amount: 250000, category: 'goals', desc: 'Emergency Fund Transfer', date: getRealisticDate(14) },
        { id: 't12', amount: 150000, category: 'goals', desc: 'Laptop Upgrade Savings', date: getRealisticDate(3) }
      ],
      addTransaction: (tx) => set((state) => ({ 
        // If tx already has a date from the UI (like historical input), use it, otherwise fallback to now
        transactions: [...state.transactions, { ...tx, id: Date.now().toString(), date: tx.date || new Date().toISOString() }] 
      })),
      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
      removeMultipleTransactions: (ids) => set((state) => ({
        transactions: state.transactions.filter(t => !ids.includes(t.id))
      })),

      goals: [
        {
          id: 'g1',
          name: 'Emergency Fund',
          currentCost: 10000000,
          years: 1,
          inflationRate: 0.04,
          icon: 'savings'
        },
        {
          id: 'g2',
          name: 'First Vehicle (Used Bike)',
          currentCost: 15000000,
          years: 2,
          inflationRate: 0.02,
          icon: 'bike'
        },
        {
          id: 'g3',
          name: 'Thesis Laptop Upgrade',
          currentCost: 12000000,
          years: 1.5,
          inflationRate: 0.04,
          icon: 'laptop'
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
        const { income, goals } = get();
        
        // Find how many OTHER goals exist and how much they require per month
        const otherGoals = goals.filter(g => g.id !== goal.id);
        const otherGoalsMonthlyRequired = otherGoals.reduce((acc, g) => {
          const fc = g.currentCost * Math.pow(1 + g.inflationRate, g.years);
          return acc + (fc / (g.years * 12));
        }, 0);

        const futureCost = goal.currentCost * Math.pow(1 + goal.inflationRate, goal.years);
        const monthlyRequired = futureCost / (goal.years * 12);
        
        // Total budget for ALL goals is 20% of income. 
        // The available budget for THIS goal is 20% minus whatever the OTHER goals are eating up.
        const totalGoalsBudget = income * 0.2;
        const monthlyAvailableForThisGoal = totalGoalsBudget - otherGoalsMonthlyRequired;

        // The goal is achievable if what it requires is less than or equal to the REMAINING goal budget
        const isAchievable = monthlyRequired <= monthlyAvailableForThisGoal;

        return {
          futureCost,
          monthlyRequired,
          monthlyAvailableForThisGoal,
          totalGoalsBudget,
          otherGoalsMonthlyRequired,
          isAchievable,
          // Calculate how many extra months needed if we only rely on the remaining available budget for THIS goal
          // (if available budget is <= 0, they can never achieve it without changing income/other goals, so we cap it to Infinity)
          monthsToPush: monthlyAvailableForThisGoal > 0 
            ? Math.ceil(futureCost / monthlyAvailableForThisGoal) - (goal.years * 12)
            : Infinity
        };
      }
    }),
    {
      name: 'fintrack-storage', 
    }
  )
);
