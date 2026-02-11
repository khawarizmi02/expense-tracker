import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Edit, Trash2, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Income, MonthClassification } from '@/types';
import { incomeService, monthClassificationService } from '@/services/storage';
import { IncomeForm } from '@/components/IncomeForm';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const incomeTypeColors: Record<Income['type'], string> = {
  Salary: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Refund: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Other: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export function Incomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [months, setMonths] = useState<MonthClassification[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('all');

  const loadData = useCallback(() => {
    const incomeData = incomeService.getAll();
    const monthData = monthClassificationService.getAll();

    setIncomes(incomeData.sort((a, b) => b.date.getTime() - a.date.getTime()));
    setMonths(monthData.sort((a, b) => b.monthNum.localeCompare(a.monthNum)));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getMonthName = (monthId: string) => {
    return months.find((m) => m.id === monthId)?.month || 'Unknown';
  };

  const filteredIncomes = filterMonth === 'all'
    ? incomes
    : incomes.filter((i) => i.monthClassificationId === filterMonth);

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      incomeService.delete(deletingId);
      toast.success('Income deleted');
      loadData();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingIncome(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incomes</h1>
          <p className="text-muted-foreground">Track your income sources</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      {incomes.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-emerald-500">RM {totalIncome.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[200px]">
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

      {filteredIncomes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Incomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {incomes.length === 0 ? 'No income recorded yet' : 'No income for selected filter'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {incomes.length === 0 ? 'Click "Add Income" to record your first income' : 'Try changing the filter'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Incomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Income</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Month</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell className="font-medium">{income.income}</TableCell>
                      <TableCell className="text-emerald-500 font-semibold">RM {income.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(income.date, 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={incomeTypeColors[income.type]} variant="outline">{income.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{getMonthName(income.monthClassificationId)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(income)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(income.id)}>
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

      <IncomeForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={loadData}
        editData={editingIncome}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this income. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
