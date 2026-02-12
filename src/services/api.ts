import type { MonthClassification, Budget, Expense, Income } from "@/types";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_N8N_BASE_URL || "http://localhost:5678";
const API_KEY = import.meta.env.VITE_API_KEY || "";

// Webhook paths for each entity
const WEBHOOK_PATHS = {
  MONTH_CLASSIFICATIONS: "/webhook/month-classifications",
  BUDGETS: "/webhook/budgets",
  EXPENSES: "/webhook/expenses",
  INCOMES: "/webhook/incomes",
} as const;

// Helper to make authenticated requests
async function apiRequest<T>(
  path: string,
  method: string = "GET",
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add API key to headers if configured
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const options: RequestInit = {
    method,
    headers,
    mode: "cors",
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API request error (${method} ${path}):`, error);
    throw error;
  }
}

// Helper to convert date strings to Date objects
function parseDates<
  T extends { date?: string | Date; createdAt: string | Date },
>(item: T): T {
  return {
    ...item,
    date: item.date ? new Date(item.date) : undefined,
    createdAt: new Date(item.createdAt),
  } as T;
}

// Month Classification API Service
const monthClassificationApiService = {
  getAll: async (): Promise<MonthClassification[]> => {
    const response = await apiRequest<MonthClassification[]>(
      WEBHOOK_PATHS.MONTH_CLASSIFICATIONS,
    );
    return response.map(parseDates);
  },

  getById: async (id: string): Promise<MonthClassification | undefined> => {
    try {
      const response = await apiRequest<MonthClassification>(
        `${WEBHOOK_PATHS.MONTH_CLASSIFICATIONS}/${id}`,
      );
      return parseDates(response);
    } catch {
      return undefined;
    }
  },

  create: async (
    data: Omit<MonthClassification, "id" | "createdAt">,
  ): Promise<MonthClassification> => {
    const response = await apiRequest<MonthClassification>(
      WEBHOOK_PATHS.MONTH_CLASSIFICATIONS,
      "POST",
      data,
    );
    return parseDates(response);
  },

  update: async (
    id: string,
    data: Partial<Omit<MonthClassification, "id" | "createdAt">>,
  ): Promise<MonthClassification | null> => {
    try {
      const response = await apiRequest<MonthClassification>(
        `${WEBHOOK_PATHS.MONTH_CLASSIFICATIONS}/${id}`,
        "PATCH",
        data,
      );
      return parseDates(response);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(
        `${WEBHOOK_PATHS.MONTH_CLASSIFICATIONS}/${id}`,
        "DELETE",
      );
      return true;
    } catch {
      return false;
    }
  },
};

// Budget API Service
const budgetApiService = {
  getAll: async (): Promise<Budget[]> => {
    const response = await apiRequest<Budget[]>(WEBHOOK_PATHS.BUDGETS);
    return response.map(parseDates);
  },

  getById: async (id: string): Promise<Budget | undefined> => {
    try {
      const response = await apiRequest<Budget>(
        `${WEBHOOK_PATHS.BUDGETS}/${id}`,
      );
      return parseDates(response);
    } catch {
      return undefined;
    }
  },

  create: async (data: Omit<Budget, "id" | "createdAt">): Promise<Budget> => {
    const response = await apiRequest<Budget>(
      WEBHOOK_PATHS.BUDGETS,
      "POST",
      data,
    );
    return parseDates(response);
  },

  update: async (
    id: string,
    data: Partial<Omit<Budget, "id" | "createdAt">>,
  ): Promise<Budget | null> => {
    try {
      const response = await apiRequest<Budget>(
        `${WEBHOOK_PATHS.BUDGETS}/${id}`,
        "PATCH",
        data,
      );
      return parseDates(response);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`${WEBHOOK_PATHS.BUDGETS}/${id}`, "DELETE");
      return true;
    } catch {
      return false;
    }
  },
};

// Expense API Service
const expenseApiService = {
  getAll: async (): Promise<Expense[]> => {
    const response = await apiRequest<Expense[]>(WEBHOOK_PATHS.EXPENSES);
    return response.map(parseDates);
  },

  getById: async (id: string): Promise<Expense | undefined> => {
    try {
      const response = await apiRequest<Expense>(
        `${WEBHOOK_PATHS.EXPENSES}/${id}`,
      );
      return parseDates(response);
    } catch {
      return undefined;
    }
  },

  getByMonthClassification: async (
    monthClassificationId: string,
  ): Promise<Expense[]> => {
    const response = await apiRequest<Expense[]>(
      `${WEBHOOK_PATHS.EXPENSES}?monthClassificationId=${monthClassificationId}`,
    );
    return response.map(parseDates);
  },

  getByBudget: async (budgetId: string): Promise<Expense[]> => {
    const response = await apiRequest<Expense[]>(
      `${WEBHOOK_PATHS.EXPENSES}?budgetId=${budgetId}`,
    );
    return response.map(parseDates);
  },

  create: async (data: Omit<Expense, "id" | "createdAt">): Promise<Expense> => {
    const response = await apiRequest<Expense>(
      WEBHOOK_PATHS.EXPENSES,
      "POST",
      data,
    );
    return parseDates(response);
  },

  update: async (
    id: string,
    data: Partial<Omit<Expense, "id" | "createdAt">>,
  ): Promise<Expense | null> => {
    try {
      const response = await apiRequest<Expense>(
        `${WEBHOOK_PATHS.EXPENSES}/${id}`,
        "PATCH",
        data,
      );
      return parseDates(response);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`${WEBHOOK_PATHS.EXPENSES}/${id}`, "DELETE");
      return true;
    } catch {
      return false;
    }
  },
};

// Income API Service
const incomeApiService = {
  getAll: async (): Promise<Income[]> => {
    const response = await apiRequest<Income[]>(WEBHOOK_PATHS.INCOMES);
    return response.map(parseDates);
  },

  getById: async (id: string): Promise<Income | undefined> => {
    try {
      const response = await apiRequest<Income>(
        `${WEBHOOK_PATHS.INCOMES}/${id}`,
      );
      return parseDates(response);
    } catch {
      return undefined;
    }
  },

  getByMonthClassification: async (
    monthClassificationId: string,
  ): Promise<Income[]> => {
    const response = await apiRequest<Income[]>(
      `${WEBHOOK_PATHS.INCOMES}?monthClassificationId=${monthClassificationId}`,
    );
    return response.map(parseDates);
  },

  getByType: async (type: Income["type"]): Promise<Income[]> => {
    const response = await apiRequest<Income[]>(
      `${WEBHOOK_PATHS.INCOMES}?type=${type}`,
    );
    return response.map(parseDates);
  },

  create: async (data: Omit<Income, "id" | "createdAt">): Promise<Income> => {
    const response = await apiRequest<Income>(
      WEBHOOK_PATHS.INCOMES,
      "POST",
      data,
    );
    return parseDates(response);
  },

  update: async (
    id: string,
    data: Partial<Omit<Income, "id" | "createdAt">>,
  ): Promise<Income | null> => {
    try {
      const response = await apiRequest<Income>(
        `${WEBHOOK_PATHS.INCOMES}/${id}`,
        "PATCH",
        data,
      );
      return parseDates(response);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`${WEBHOOK_PATHS.INCOMES}/${id}`, "DELETE");
      return true;
    } catch {
      return false;
    }
  },
};

export {
  incomeApiService,
  expenseApiService,
  budgetApiService,
  monthClassificationApiService,
};
