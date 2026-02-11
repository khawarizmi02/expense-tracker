import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { expenseService, incomeService, budgetService, monthClassificationService } from '@/services/storage';
import { MonthClassification, Expense, Income } from '@/types';
import { format } from 'date-fns';

export function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [months, setMonths] = useState<MonthClassification[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const monthData = monthClassificationService.getAll();
    const expenseData = expenseService.getAll();
    const incomeData = incomeService.getAll();
    const budgetData = budgetService.getAll();

    setMonths(monthData.sort((a, b) => b.monthNum.localeCompare(a.monthNum)));
    setExpenses(expenseData);
    setIncomes(incomeData);
    setTotalBudget(budgetData.reduce((sum, b) => sum + b.monthlyBudget, 0));
  };

  const filteredExpenses = selectedMonth === 'all'
    ? expenses
    : expenses.filter((e) => e.monthClassificationId === selectedMonth);

  const filteredIncomes = selectedMonth === 'all'
    ? incomes
    : incomes.filter((i) => i.monthClassificationId === selectedMonth);

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpense;
  const budgetUsed = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  // Recent transactions (last 5)
  const allTransactions = [
    ...filteredExpenses.map((e) => ({ ...e, type: 'expense' as const })),
    ...filteredIncomes.map((i) => ({ ...i, type: 'income' as const })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const getBudgetName = (budgetId: string) => {
    return budgetService.getById(budgetId)?.category || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your finances</p>
        </div>
        {months.length > 0 && (
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.id} value={month.id}>
                  {month.month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">RM {totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth === 'all' ? 'All time' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">RM {totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth === 'all' ? 'All time' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              RM {balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetUsed > 100 ? 'text-rose-500' : 'text-amber-500'}`}>
              {budgetUsed.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Of monthly budget</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {allTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start by adding your first expense or income</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {'expense' in transaction ? transaction.expense : transaction.income}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{format(transaction.date, 'dd MMM yyyy')}</p>
                        {transaction.type === 'expense' && (
                          <Badge variant="outline" className="text-xs">
                            {getBudgetName((transaction as Expense).budgetId)}
                          </Badge>
                        )}
                        {transaction.type === 'income' && (
                          <Badge variant="outline" className="text-xs">
                            {(transaction as Income).type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}RM {transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {months.length === 0 && expenses.length === 0 && incomes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Wallet className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Get Started</h3>
                <p className="text-sm text-muted-foreground mt-2">Start tracking your finances by:</p>
              </div>
              <div className="flex flex-col gap-2 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">1</div>
                  <span>Create a month classification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">2</div>
                  <span>Set up your budget categories</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">3</div>
                  <span>Add your expenses and incomes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
