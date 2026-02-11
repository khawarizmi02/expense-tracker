// Database entity types

export interface MonthClassification {
  id: string;
  month: string; // e.g., "December 2026"
  monthNum: string; // format: "mm-yy", e.g., "01-26"
  createdAt: Date;
}

export interface Budget {
  id: string;
  category: string; // budget category name
  monthlyBudget: number;
  categoryType: 'Wants' | 'Needs' | 'Savings';
  createdAt: Date;
}

export interface Expense {
  id: string;
  expense: string; // expense name
  date: Date;
  amount: number;
  budgetId: string; // relation to Budget
  monthClassificationId: string; // relation to Month Classification
  createdAt: Date;
}

export interface Income {
  id: string;
  income: string; // income name
  amount: number;
  date: Date;
  monthClassificationId: string; // relation to Month Classification
  type: 'Salary' | 'Refund' | 'Other';
  createdAt: Date;
}

// Summary types for dashboard
export interface MonthSummary {
  monthClassification: MonthClassification;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expensesByBudget: {
    budget: Budget;
    total: number;
    percentage: number;
  }[];
  incomesByType: {
    type: Income['type'];
    total: number;
  }[];
}

export interface BudgetWithSpending extends Budget {
  totalSpent: number;
  remaining: number;
  percentage: number;
}
