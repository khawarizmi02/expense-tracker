import type { MonthClassification, Budget, Expense, Income } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  MONTH_CLASSIFICATIONS: "expense_tracker_month_classifications",
  BUDGETS: "expense_tracker_budgets",
  EXPENSES: "expense_tracker_expenses",
  INCOMES: "expense_tracker_incomes",
} as const;

// Type for raw storage items with date strings
interface RawStorageItem {
  date?: string | Date;
  createdAt: string | Date;
  [key: string]: unknown;
}

// Generic storage helpers
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data) as RawStorageItem[];
    return parsed.map((item) => ({
      ...item,
      date: item.date ? new Date(item.date) : undefined,
      createdAt: new Date(item.createdAt),
    })) as T[];
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
  }
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Month Classification Service
export const monthClassificationService = {
  getAll: (): MonthClassification[] => {
    return getFromStorage<MonthClassification>(
      STORAGE_KEYS.MONTH_CLASSIFICATIONS,
    );
  },

  getById: (id: string): MonthClassification | undefined => {
    const items = monthClassificationService.getAll();
    return items.find((item) => item.id === id);
  },

  create: (
    data: Omit<MonthClassification, "id" | "createdAt">,
  ): MonthClassification => {
    const items = monthClassificationService.getAll();
    const newItem: MonthClassification = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.MONTH_CLASSIFICATIONS, items);
    return newItem;
  },

  update: (
    id: string,
    data: Partial<Omit<MonthClassification, "id" | "createdAt">>,
  ): MonthClassification | null => {
    const items = monthClassificationService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.MONTH_CLASSIFICATIONS, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = monthClassificationService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.MONTH_CLASSIFICATIONS, filtered);
    return true;
  },
};

// Budget Service
export const budgetService = {
  getAll: (): Budget[] => {
    return getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
  },

  getById: (id: string): Budget | undefined => {
    const items = budgetService.getAll();
    return items.find((item) => item.id === id);
  },

  create: (data: Omit<Budget, "id" | "createdAt">): Budget => {
    const items = budgetService.getAll();
    const newItem: Budget = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.BUDGETS, items);
    return newItem;
  },

  update: (
    id: string,
    data: Partial<Omit<Budget, "id" | "createdAt">>,
  ): Budget | null => {
    const items = budgetService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.BUDGETS, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = budgetService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.BUDGETS, filtered);
    return true;
  },
};

// Expense Service
export const expenseService = {
  getAll: (): Expense[] => {
    return getFromStorage<Expense>(STORAGE_KEYS.EXPENSES);
  },

  getById: (id: string): Expense | undefined => {
    const items = expenseService.getAll();
    return items.find((item) => item.id === id);
  },

  getByMonthClassification: (monthClassificationId: string): Expense[] => {
    const items = expenseService.getAll();
    return items.filter(
      (item) => item.monthClassificationId === monthClassificationId,
    );
  },

  getByBudget: (budgetId: string): Expense[] => {
    const items = expenseService.getAll();
    return items.filter((item) => item.budgetId === budgetId);
  },

  create: (data: Omit<Expense, "id" | "createdAt">): Expense => {
    const items = expenseService.getAll();
    const newItem: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.EXPENSES, items);
    return newItem;
  },

  update: (
    id: string,
    data: Partial<Omit<Expense, "id" | "createdAt">>,
  ): Expense | null => {
    const items = expenseService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.EXPENSES, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = expenseService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.EXPENSES, filtered);
    return true;
  },
};

// Income Service
export const incomeService = {
  getAll: (): Income[] => {
    return getFromStorage<Income>(STORAGE_KEYS.INCOMES);
  },

  getById: (id: string): Income | undefined => {
    const items = incomeService.getAll();
    return items.find((item) => item.id === id);
  },

  getByMonthClassification: (monthClassificationId: string): Income[] => {
    const items = incomeService.getAll();
    return items.filter(
      (item) => item.monthClassificationId === monthClassificationId,
    );
  },

  getByType: (type: Income["type"]): Income[] => {
    const items = incomeService.getAll();
    return items.filter((item) => item.type === type);
  },

  create: (data: Omit<Income, "id" | "createdAt">): Income => {
    const items = incomeService.getAll();
    const newItem: Income = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.INCOMES, items);
    return newItem;
  },

  update: (
    id: string,
    data: Partial<Omit<Income, "id" | "createdAt">>,
  ): Income | null => {
    const items = incomeService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.INCOMES, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = incomeService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.INCOMES, filtered);
    return true;
  },
};
