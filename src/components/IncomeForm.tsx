import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Income } from '@/types';
import { incomeService, monthClassificationService } from '@/services/storage';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: Income;
}

const INCOME_TYPES = ['Salary', 'Refund', 'Other'] as const;

export function IncomeForm({ open, onOpenChange, onSuccess, editData }: IncomeFormProps) {
  const [income, setIncome] = useState(editData?.income || '');
  const [amount, setAmount] = useState(editData?.amount.toString() || '');
  const [date, setDate] = useState<Date>(editData?.date || new Date());
  const [type, setType] = useState<Income['type']>(editData?.type || 'Salary');
  const [monthClassificationId, setMonthClassificationId] = useState(editData?.monthClassificationId || '');
  const [loading, setLoading] = useState(false);

  const months = monthClassificationService.getAll();

  useEffect(() => {
    if (editData) {
      setIncome(editData.income);
      setAmount(editData.amount.toString());
      setDate(editData.date);
      setType(editData.type);
      setMonthClassificationId(editData.monthClassificationId);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const incomeAmount = parseFloat(amount);
      if (isNaN(incomeAmount) || incomeAmount <= 0) {
        toast.error('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (!monthClassificationId) {
        toast.error('Please select month');
        setLoading(false);
        return;
      }

      if (editData) {
        incomeService.update(editData.id, {
          income,
          amount: incomeAmount,
          date,
          type,
          monthClassificationId,
        });
        toast.success('Income updated successfully');
      } else {
        incomeService.create({
          income,
          amount: incomeAmount,
          date,
          type,
          monthClassificationId,
        });
        toast.success('Income created successfully');
      }
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save income');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIncome('');
    setAmount('');
    setDate(new Date());
    setType('Salary');
    setMonthClassificationId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit' : 'Add'} Income</DialogTitle>
            <DialogDescription>
              Record a new income and categorize it by type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="income">Income Name</Label>
              <Input
                id="income"
                placeholder="e.g., Salary, Bonus, Refund"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (RM)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="e.g., 5000.00"
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
                    className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Income Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as Income['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_TYPES.map((incomeType) => (
                    <SelectItem key={incomeType} value={incomeType}>
                      {incomeType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="month">Month Classification</Label>
              <Select value={monthClassificationId} onValueChange={setMonthClassificationId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No months available</div>
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || months.length === 0}>
              {loading ? 'Saving...' : editData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
