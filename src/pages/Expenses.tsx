import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Edit, Trash2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Expense, Budget, MonthClassification } from "@/types";
import {
  expenseService,
  budgetService,
  monthClassificationService,
} from "@/services/storage";
import { ExpenseForm } from "@/components/ExpenseForm";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [months, setMonths] = useState<MonthClassification[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>("all");

  const loadData = useCallback(() => {
    const expenseData = expenseService.getAll();
    const budgetData = budgetService.getAll();
    const monthData = monthClassificationService.getAll();

    setExpenses(
      expenseData.sort((a, b) => b.date.getTime() - a.date.getTime()),
    );
    setBudgets(budgetData);
    setMonths(monthData.sort((a, b) => b.monthNum.localeCompare(a.monthNum)));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBudgetName = (budgetId: string) => {
    return budgets.find((b) => b.id === budgetId)?.category || "Unknown";
  };

  const getMonthName = (monthId: string) => {
    return months.find((m) => m.id === monthId)?.month || "Unknown";
  };

  const filteredExpenses =
    filterMonth === "all"
      ? expenses
      : expenses.filter((e) => e.monthClassificationId === filterMonth);

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      expenseService.delete(deletingId);
      toast.success("Expense deleted");
      loadData();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your expenses
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {expenses.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">
                  RM {totalExpense.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month.id} value={month.id}>
                        {month.month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredExpenses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {expenses.length === 0
                  ? "No expenses yet"
                  : "No expenses for selected filter"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {expenses.length === 0
                  ? 'Click "Add Expense" to create your first expense'
                  : "Try changing the filter"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Month
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {expense.expense}
                      </TableCell>
                      <TableCell>RM {expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {format(expense.date, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getBudgetName(expense.budgetId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {getMonthName(expense.monthClassificationId)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <ExpenseForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={loadData}
        editData={editingExpense}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
