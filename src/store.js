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
