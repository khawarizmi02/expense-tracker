import type { MonthClassification, Budget, Expense, Income } from "@/types";
import {
  monthClassificationApiService,
  budgetApiService,
  expenseApiService,
  incomeApiService,
} from "./api";

// Storage mode: 'localStorage' or 'api'
const STORAGE_MODE = (import.meta.env.VITE_STORAGE_MODE || "localStorage") as
  | "localStorage"
  | "api";

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
function getFromStorage<T>(key: string): T[] {
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
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Month Classification Service
export const monthClassificationService = {
  getAll: async (): Promise<MonthClassification[]> => {
    if (STORAGE_MODE === "api") {
      return monthClassificationApiService.getAll();
    }
    return getFromStorage<MonthClassification>(
      STORAGE_KEYS.MONTH_CLASSIFICATIONS,
    );
  },

  getById: async (id: string): Promise<MonthClassification | undefined> => {
    if (STORAGE_MODE === "api") {
      return monthClassificationApiService.getById(id);
    }
    const items = await monthClassificationService.getAll();
    return items.find((item) => item.id === id);
  },

  create: async (
    data: Omit<MonthClassification, "id" | "createdAt">,
  ): Promise<MonthClassification> => {
    if (STORAGE_MODE === "api") {
      return monthClassificationApiService.create(data);
    }
    const items = await monthClassificationService.getAll();
    const newItem: MonthClassification = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.MONTH_CLASSIFICATIONS, items);
    return newItem;
  },

  update: async (
    id: string,
    data: Partial<Omit<MonthClassification, "id" | "createdAt">>,
  ): Promise<MonthClassification | null> => {
    if (STORAGE_MODE === "api") {
      return monthClassificationApiService.update(id, data);
    }
    const items = await monthClassificationService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.MONTH_CLASSIFICATIONS, items);
    return items[index];
  },

  delete: async (id: string): Promise<boolean> => {
    if (STORAGE_MODE === "api") {
      return monthClassificationApiService.delete(id);
    }
    const items = await monthClassificationService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.MONTH_CLASSIFICATIONS, filtered);
    return true;
  },
};

// Budget Service
export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    if (STORAGE_MODE === "api") {
      return budgetApiService.getAll();
    }
    return getFromStorage<Budget>(STORAGE_KEYS.BUDGETS);
  },

  getById: async (id: string): Promise<Budget | undefined> => {
    if (STORAGE_MODE === "api") {
      return budgetApiService.getById(id);
    }
    const items = await budgetService.getAll();
    return items.find((item) => item.id === id);
  },

  create: async (data: Omit<Budget, "id" | "createdAt">): Promise<Budget> => {
    if (STORAGE_MODE === "api") {
      return budgetApiService.create(data);
    }
    const items = await budgetService.getAll();
    const newItem: Budget = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.BUDGETS, items);
    return newItem;
  },

  update: async (
    id: string,
    data: Partial<Omit<Budget, "id" | "createdAt">>,
  ): Promise<Budget | null> => {
    if (STORAGE_MODE === "api") {
      return budgetApiService.update(id, data);
    }
    const items = await budgetService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.BUDGETS, items);
    return items[index];
  },

  delete: async (id: string): Promise<boolean> => {
    if (STORAGE_MODE === "api") {
      return budgetApiService.delete(id);
    }
    const items = await budgetService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.BUDGETS, filtered);
    return true;
  },
};

// Expense Service
export const expenseService = {
  getAll: async (): Promise<Expense[]> => {
    if (STORAGE_MODE === "api") {
      return expenseApiService.getAll();
    }
    return getFromStorage<Expense>(STORAGE_KEYS.EXPENSES);
  },

  getById: async (id: string): Promise<Expense | undefined> => {
    if (STORAGE_MODE === "api") {
      return expenseApiService.getById(id);
    }
    const items = await expenseService.getAll();
    return items.find((item) => item.id === id);
  },

  getByMonthClassification: async (
    monthClassificationId: string,
  ): Promise<Expense[]> => {
    if (STORAGE_MODE === "api") {
      return expenseApiService.getByMonthClassification(monthClassificationId);
    }
    const items = await expenseService.getAll();
    return items.filter(
      (item) => item.monthClassificationId === monthClassificationId,
    );
  },

  getByBudget: async (budgetId: string): Promise<Expense[]> => {
    if (STORAGE_MODE === "api") {
      return expenseApiService.getByBudget(budgetId);
    }
    const items = await expenseService.getAll();
    return items.filter((item) => item.budgetId === budgetId);
  },

  create: async (data: Omit<Expense, "id" | "createdAt">): Promise<Expense> => {
    if (STORAGE_MODE === "api") {
      return expenseApiService.create(data);
    }
    const items = await expenseService.getAll();
    const newItem: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.EXPENSES, items);
    return newItem;
  },

  update: async (
    id: string,
    data: Partial<Omit<Expense, "id" | "createdAt">>,
  ): Promise<Expense | null> => {
    if (STORAGE_MODE === "api") {
      return expenseApiService.update(id, data);
    }
    const items = await expenseService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.EXPENSES, items);
    return items[index];
  },

  delete: async (id: string): Promise<boolean> => {
    if (STORAGE_MODE === "api") {
      return expenseApiService.delete(id);
    }
    const items = await expenseService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.EXPENSES, filtered);
    return true;
  },
};

// Income Service
export const incomeService = {
  getAll: async (): Promise<Income[]> => {
    if (STORAGE_MODE === "api") {
      return incomeApiService.getAll();
    }
    return getFromStorage<Income>(STORAGE_KEYS.INCOMES);
  },

  getById: async (id: string): Promise<Income | undefined> => {
    if (STORAGE_MODE === "api") {
      return incomeApiService.getById(id);
    }
    const items = await incomeService.getAll();
    return items.find((item) => item.id === id);
  },

  getByMonthClassification: async (
    monthClassificationId: string,
  ): Promise<Income[]> => {
    if (STORAGE_MODE === "api") {
      return incomeApiService.getByMonthClassification(monthClassificationId);
    }
    const items = await incomeService.getAll();
    return items.filter(
      (item) => item.monthClassificationId === monthClassificationId,
    );
  },

  getByType: async (type: Income["type"]): Promise<Income[]> => {
    if (STORAGE_MODE === "api") {
      return incomeApiService.getByType(type);
    }
    const items = await incomeService.getAll();
    return items.filter((item) => item.type === type);
  },

  create: async (data: Omit<Income, "id" | "createdAt">): Promise<Income> => {
    if (STORAGE_MODE === "api") {
      return incomeApiService.create(data);
    }
    const items = await incomeService.getAll();
    const newItem: Income = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    items.push(newItem);
    saveToStorage(STORAGE_KEYS.INCOMES, items);
    return newItem;
  },

  update: async (
    id: string,
    data: Partial<Omit<Income, "id" | "createdAt">>,
  ): Promise<Income | null> => {
    if (STORAGE_MODE === "api") {
      return incomeApiService.update(id, data);
    }
    const items = await incomeService.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveToStorage(STORAGE_KEYS.INCOMES, items);
    return items[index];
  },

  delete: async (id: string): Promise<boolean> => {
    if (STORAGE_MODE === "api") {
      return incomeApiService.delete(id);
    }
    const items = await incomeService.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(STORAGE_KEYS.INCOMES, filtered);
    return true;
  },
};
