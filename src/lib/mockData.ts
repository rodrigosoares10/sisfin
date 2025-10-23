export const mockMonthlyData = [
  { name: 'Jan', income: 45000, expense: 32000 },
  { name: 'Fev', income: 52000, expense: 35000 },
  { name: 'Mar', income: 48000, expense: 34000 },
  { name: 'Abr', income: 61000, expense: 38000 },
  { name: 'Mai', income: 55000, expense: 36000 },
  { name: 'Jun', income: 67000, expense: 40000 },
]

export const mockExpensesByCategory = [
  { name: 'Operacional', value: 45000 },
  { name: 'Marketing', value: 25000 },
  { name: 'Salários', value: 80000 },
  { name: 'Infraestrutura', value: 20000 },
  { name: 'Impostos', value: 30000 },
]

export const mockRevenueByProduct = [
  { name: 'Produto A', value: 85000 },
  { name: 'Produto B', value: 65000 },
  { name: 'Produto C', value: 45000 },
  { name: 'Produto D', value: 35000 },
  { name: 'Produto E', value: 25000 },
]

export const mockCashFlow = [
  { name: 'Jan', cashFlow: 45000 },
  { name: 'Fev', cashFlow: 62000 },
  { name: 'Mar', cashFlow: 76000 },
  { name: 'Abr', cashFlow: 99000 },
  { name: 'Mai', cashFlow: 118000 },
  { name: 'Jun', cashFlow: 145000 },
]

export const calculateKPIs = () => {
  const currentMonth = mockMonthlyData[mockMonthlyData.length - 1]
  const previousMonth = mockMonthlyData[mockMonthlyData.length - 2]

  const totalIncome = currentMonth.income
  const totalExpense = currentMonth.expense
  const netProfit = totalIncome - totalExpense

  const incomeChange = ((totalIncome - previousMonth.income) / previousMonth.income) * 100
  const expenseChange = ((totalExpense - previousMonth.expense) / previousMonth.expense) * 100
  const profitChange = ((netProfit - (previousMonth.income - previousMonth.expense)) / (previousMonth.income - previousMonth.expense)) * 100

  // MRR (Monthly Recurring Revenue) - calculado como média das receitas mensais
  const mrr = mockMonthlyData.reduce((acc, curr) => acc + curr.income, 0) / mockMonthlyData.length
  const previousMrr = mockMonthlyData.slice(0, -1).reduce((acc, curr) => acc + curr.income, 0) / (mockMonthlyData.length - 1)
  const mrrChange = ((mrr - previousMrr) / previousMrr) * 100

  return {
    totalIncome,
    totalExpense,
    netProfit,
    mrr,
    incomeChange,
    expenseChange,
    profitChange,
    mrrChange,
  }
}
