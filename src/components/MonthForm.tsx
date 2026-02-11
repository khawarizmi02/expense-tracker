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
import type { MonthClassification } from "@/types";
import { monthClassificationService } from "@/services/storage";
import { format } from "date-fns";
import { toast } from "sonner";

interface MonthFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: MonthClassification;
}

export function MonthForm({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: MonthFormProps) {
  const [month, setMonth] = useState(editData?.month || "");
  const [monthNum, setMonthNum] = useState(editData?.monthNum || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData) {
        monthClassificationService.update(editData.id, { month, monthNum });
        toast.success("Month classification updated successfully");
      } else {
        monthClassificationService.create({ month, monthNum });
        toast.success("Month classification created successfully");
      }
      onSuccess();
      onOpenChange(false);
      setMonth("");
      setMonthNum("");
    } catch (error) {
      toast.error("Failed to save month classification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateFromDate = () => {
    const now = new Date();
    setMonth(format(now, "MMMM yyyy"));
    setMonthNum(format(now, "MM-yy"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit" : "Add"} Month Classification
            </DialogTitle>
            <DialogDescription>
              Create a month classification to organize your expenses and
              incomes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Month Name</Label>
              <Input
                id="month"
                placeholder="e.g., December 2026"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthNum">Month Number (mm-yy)</Label>
              <Input
                id="monthNum"
                placeholder="e.g., 01-26"
                value={monthNum}
                onChange={(e) => setMonthNum(e.target.value)}
                pattern="[0-9]{2}-[0-9]{2}"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: MM-YY (e.g., 01-26)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateFromDate}
            >
              Use Current Month
            </Button>
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
