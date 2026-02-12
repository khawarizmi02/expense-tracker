import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2 } from "lucide-react";
import type { MonthClassification } from "@/types";
import { monthClassificationService } from "@/services/storage";
import { MonthForm } from "@/components/MonthForm";
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

export function Months() {
  const [months, setMonths] = useState<MonthClassification[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<
    MonthClassification | undefined
  >();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMonths = useCallback(async () => {
    const data = await monthClassificationService.getAll();
    setMonths(data.sort((a, b) => b.monthNum.localeCompare(a.monthNum)));
  }, []);

  useEffect(() => {
    loadMonths();
  }, [loadMonths]);

  const handleEdit = (month: MonthClassification) => {
    setEditingMonth(month);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await monthClassificationService.delete(deletingId);
      toast.success("Month classification deleted");
      loadMonths();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingMonth(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Month Classifications
          </h1>
          <p className="text-muted-foreground">
            Organize expenses and incomes by month
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Month
        </Button>
      </div>

      {months.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                No month classifications yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add Month" to create your first month classification
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => (
            <Card key={month.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{month.month}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {month.monthNum}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(month)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(month.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(month.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MonthForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={loadMonths}
        editData={editingMonth}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this month classification. This
              action cannot be undone.
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
