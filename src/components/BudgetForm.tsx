import { useState } from "react";
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
import type { Budget } from "@/types";
import { budgetService } from "@/services/storage";
import { toast } from "sonner";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: Budget;
}

const CATEGORY_TYPES = ["Wants", "Needs", "Savings"] as const;

export function BudgetForm({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: BudgetFormProps) {
  const [category, setCategory] = useState(editData?.category || "");
  const [monthlyBudget, setMonthlyBudget] = useState(
    editData?.monthlyBudget.toString() || "",
  );
  const [categoryType, setCategoryType] = useState<Budget["categoryType"]>(
    editData?.categoryType || "Needs",
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budgetAmount = parseFloat(monthlyBudget);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        toast.error("Please enter a valid budget amount");
        setLoading(false);
        return;
      }

      if (editData) {
        budgetService.update(editData.id, {
          category,
          monthlyBudget: budgetAmount,
          categoryType,
        });
        toast.success("Budget category updated successfully");
      } else {
        budgetService.create({
          category,
          monthlyBudget: budgetAmount,
          categoryType,
        });
        toast.success("Budget category created successfully");
      }
      onSuccess();
      onOpenChange(false);
      setCategory("");
      setMonthlyBudget("");
      setCategoryType("Needs");
    } catch (error) {
      toast.error("Failed to save budget category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit" : "Add"} Budget Category
            </DialogTitle>
            <DialogDescription>
              Create a budget category to track your spending limits.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category Name</Label>
              <Input
                id="category"
                placeholder="e.g., Transport, Food, Entertainment"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthlyBudget">Monthly Budget (RM)</Label>
              <Input
                id="monthlyBudget"
                type="number"
                step="0.01"
                placeholder="e.g., 500.00"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryType">Category Type</Label>
              <Select
                value={categoryType}
                onValueChange={(value) =>
                  setCategoryType(value as Budget["categoryType"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Wants, Needs, or Savings
              </p>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
