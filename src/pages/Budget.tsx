import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Budget as BudgetType, BudgetWithSpending } from "@/types";
import { budgetService, expenseService } from "@/services/storage";
import { BudgetForm } from "@/components/BudgetForm";
import { toast } from "sonner";
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

const categoryColors: Record<BudgetType["categoryType"], string> = {
  Wants: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Needs: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Savings: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export function Budget() {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetType | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    const [budgetData, expenses] = await Promise.all([
      budgetService.getAll(),
      expenseService.getAll(),
    ]);

    const budgetsWithSpending: BudgetWithSpending[] = budgetData.map(
      (budget) => {
        const totalSpent = expenses
          .filter((expense) => expense.budgetId === budget.id)
          .reduce((sum, expense) => sum + expense.amount, 0);

        const remaining = budget.monthlyBudget - totalSpent;
        const percentage =
          budget.monthlyBudget > 0
            ? (totalSpent / budget.monthlyBudget) * 100
            : 0;

        return {
          ...budget,
          totalSpent,
          remaining,
          percentage,
        };
      },
    );

    setBudgets(budgetsWithSpending);
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleEdit = (budget: BudgetType) => {
    setEditingBudget(budget);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await budgetService.delete(deletingId);
      toast.success("Budget category deleted");
      loadBudgets();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingBudget(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground">Manage your budget categories</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No budget categories yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add Category" to create your first budget category
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <Badge
                      className={`mt-2 ${categoryColors[budget.categoryType]}`}
                      variant="outline"
                    >
                      {budget.categoryType}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">
                      RM {budget.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">
                      RM {budget.monthlyBudget.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span
                      className={`font-semibold ${budget.remaining < 0 ? "text-destructive" : "text-emerald-500"}`}
                    >
                      RM {budget.remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={loadBudgets}
        editData={editingBudget}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this budget category. This action
              cannot be undone.
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
