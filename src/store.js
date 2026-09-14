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
      income: 18000000,
      setIncome: (income) => set({ income, hasOnboarded: true }),
      
      transactions: [
        // Needs
        { id: 't1', amount: 3500000, category: 'needs', desc: 'Apartment Rent', date: getRealisticDate(12) },
        { id: 't2', amount: 850000, category: 'needs', desc: 'Electricity & Water Bill', date: getRealisticDate(10) },
        { id: 't3', amount: 1200000, category: 'needs', desc: 'Monthly Groceries', date: getRealisticDate(8) },
        { id: 't4', amount: 350000, category: 'needs', desc: 'Internet Subscription', date: getRealisticDate(7) },
        { id: 't5', amount: 450000, category: 'needs', desc: 'Gasoline & Transport', date: getRealisticDate(5) },
        // Wants
        { id: 't6', amount: 250000, category: 'wants', desc: 'Netflix & Spotify', date: getRealisticDate(15) },
        { id: 't7', amount: 650000, category: 'wants', desc: 'Weekend Dinner Out', date: getRealisticDate(11) },
        { id: 't8', amount: 320000, category: 'wants', desc: 'Coffee Shop Sessions', date: getRealisticDate(9) },
        { id: 't9', amount: 850000, category: 'wants', desc: 'New Sneakers', date: getRealisticDate(4) },
        { id: 't10', amount: 150000, category: 'wants', desc: 'Cinema Tickets', date: getRealisticDate(2) },
        // Goals 
        { id: 't11', amount: 1500000, category: 'goals', desc: 'Transfer to Emergency Fund', date: getRealisticDate(14) },
        { id: 't12', amount: 850000, category: 'goals', desc: 'S&P 500 Index Fund', date: getRealisticDate(3) }
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
          name: 'Dream Wedding',
          currentCost: 150000000,
          years: 3,
          inflationRate: 0.04,
          icon: 'heart'
        },
        {
          id: 'g2',
          name: 'First Car (Used)',
          currentCost: 85000000,
          years: 2,
          inflationRate: 0.02,
          icon: 'car'
        },
        {
          id: 'g3',
          name: 'Japan Trip 2027',
          currentCost: 25000000,
          years: 1.5,
          inflationRate: 0.04,
          icon: 'plane'
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
