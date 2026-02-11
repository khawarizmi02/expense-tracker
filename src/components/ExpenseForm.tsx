import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Expense } from "@/types";
import {
  expenseService,
  budgetService,
  monthClassificationService,
} from "@/services/storage";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: Expense;
}

export function ExpenseForm({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: ExpenseFormProps) {
  const [expense, setExpense] = useState(editData?.expense || "");
  const [amount, setAmount] = useState(editData?.amount.toString() || "");
  const [date, setDate] = useState<Date>(editData?.date || new Date());
  const [budgetId, setBudgetId] = useState(editData?.budgetId || "");
  const [monthClassificationId, setMonthClassificationId] = useState(
    editData?.monthClassificationId || "",
  );
  const [loading, setLoading] = useState(false);

  const budgets = budgetService.getAll();
  const months = monthClassificationService.getAll();

  useEffect(() => {
    if (editData) {
      setExpense(editData.expense);
      setAmount(editData.amount.toString());
      setDate(editData.date);
      setBudgetId(editData.budgetId);
      setMonthClassificationId(editData.monthClassificationId);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expenseAmount = parseFloat(amount);
      if (isNaN(expenseAmount) || expenseAmount <= 0) {
        toast.error("Please enter a valid amount");
        setLoading(false);
        return;
      }

      if (!budgetId || !monthClassificationId) {
        toast.error("Please select budget and month");
        setLoading(false);
        return;
      }

      if (editData) {
        expenseService.update(editData.id, {
          expense,
          amount: expenseAmount,
          date,
          budgetId,
          monthClassificationId,
        });
        toast.success("Expense updated successfully");
      } else {
        expenseService.create({
          expense,
          amount: expenseAmount,
          date,
          budgetId,
          monthClassificationId,
        });
        toast.success("Expense created successfully");
      }
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save expense");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setExpense("");
    setAmount("");
    setDate(new Date());
    setBudgetId("");
    setMonthClassificationId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editData ? "Edit" : "Add"} Expense</DialogTitle>
            <DialogDescription>
              Record a new expense and assign it to a budget category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="expense">Expense Name</Label>
              <Input
                id="expense"
                placeholder="e.g., Duit minyak moto"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (RM)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="e.g., 50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget Category</Label>
              <Select value={budgetId} onValueChange={setBudgetId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget category" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No budget categories available
                    </div>
                  ) : (
                    budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.category} (RM {budget.monthlyBudget})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="month">Month Classification</Label>
              <Select
                value={monthClassificationId}
                onValueChange={setMonthClassificationId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No months available
                    </div>
                  ) : (
                    months.map((month) => (
                      <SelectItem key={month.id} value={month.id}>
                        {month.month} ({month.monthNum})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || budgets.length === 0 || months.length === 0}
            >
              {loading ? "Saving..." : editData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
