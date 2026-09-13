# Software Requirements Specification (SRS)
**Tech Stack:** React (Vite) / Vanilla JS, LocalStorage.
**Core Logic:**
- `FutureCost = CurrentCost * (1 + InflationRate)^Years`
- `MonthlyNeeds = Income * 0.5`
- `MonthlyWants = Income * 0.3`
- `MonthlyGoals = Income * 0.2`
- `IsAchievable = (FutureCost / Months) <= MonthlyGoals`
**Data Schema (JSON):**
`User { income: number }`
`Goal { id, name, currentCost, futureCost, deadline, monthlyRequired }`
`Transaction { id, type (need/want/goal), amount, date }`
