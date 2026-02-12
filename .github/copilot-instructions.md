# Expense Tracker - AI Coding Agent Instructions

## Project Overview
A React PWA expense tracker using localStorage (migration-ready for n8n/APIs). Built with React 19, Vite 7, TypeScript, Tailwind v4, shadcn/ui, and React Router v7.

## Architecture & Data Flow

### Storage Layer Pattern
All data flows through service modules in [`src/services/storage.ts`](src/services/storage.ts):
- **Services**: `monthClassificationService`, `budgetService`, `expenseService`, `incomeService`
- Each service exposes: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`
- Services use generic `getFromStorage<T>()` and `saveToStorage<T>()` helpers
- Date serialization is handled automatically (string ↔ Date conversion)
- IDs generated via `generateId()`: `${Date.now()}-${random}`
- **Migration-ready**: Replace localStorage logic in these services to switch to API/n8n backend

### Entity Relationships
Defined in [`src/types/index.ts`](src/types/index.ts):
- `MonthClassification` (parent) → `Expense`, `Income` (children via `monthClassificationId`)
- `Budget` (parent) → `Expense` (child via `budgetId`)
- Budget types: `'Wants' | 'Needs' | 'Savings'`
- Income types: `'Salary' | 'Refund' | 'Other'`

### Page Architecture
- [`src/pages/Dashboard.tsx`](src/pages/Dashboard.tsx): Aggregates data from all services, filters by month, calculates summaries
- [`src/pages/Expenses.tsx`](src/pages/Expenses.tsx), [`Incomes.tsx`](src/pages/Incomes.tsx), [`Budget.tsx`](src/pages/Budget.tsx), [`Months.tsx`](src/pages/Months.tsx): CRUD interfaces with table displays
- Pattern: Pages use `useState` + `useEffect` + `useCallback` with `loadData()` function to refresh after mutations

## Development Conventions

### Component Structure
- **Form dialogs**: `*Form.tsx` components handle create/edit via controlled inputs
  - Example: [`ExpenseForm.tsx`](src/components/ExpenseForm.tsx) - Uses `editData` prop to distinguish create vs update
  - Validation: Check for valid amounts, required selects before submission
  - Toast notifications: `toast.success()` / `toast.error()` from `sonner`
- **UI components**: shadcn/ui in [`src/components/ui/`](src/components/ui/) (auto-generated, modify sparingly)
- **Layout**: [`AppLayout.tsx`](src/components/AppLayout.tsx) - Responsive sidebar (desktop) + hamburger menu (mobile)

### Styling & Theming
- Tailwind v4 with CSS variables (see [`components.json`](components.json) - style: "new-york")
- Theme system: [`ThemeProvider.tsx`](src/components/ThemeProvider.tsx) using `next-themes` (light/dark/system)
- Use `cn()` from [`lib/utils.ts`](src/lib/utils.ts) for conditional class merging
- Color scheme uses CSS variables (e.g., `bg-primary`, `text-muted-foreground`)

### Routing
- [`src/App.tsx`](src/App.tsx): React Router v7 with routes: `/`, `/expenses`, `/incomes`, `/budget`, `/months`
- Navigation array in [`AppLayout.tsx`](src/components/AppLayout.tsx) controls sidebar links

## Key Commands
```bash
bun run dev          # Start dev server (Vite)
bun run build        # TypeScript check + Vite build
bun run lint         # ESLint check
bun run lint:fix     # Auto-fix linting issues
bun run preview      # Preview production build
```

## PWA Configuration
- [`vite.config.ts`](vite.config.ts): `vite-plugin-pwa` with `autoUpdate` registration
- Manifest in [`public/manifest.json`](public/manifest.json) (also inline config in vite.config.ts)
- Workbox caching configured for offline support

## Common Tasks

### Adding a New Entity Type
1. Define interface in [`src/types/index.ts`](src/types/index.ts)
2. Create service in [`src/services/storage.ts`](src/services/storage.ts) with STORAGE_KEY
3. Add CRUD page in [`src/pages/`](src/pages/)
4. Create form component in [`src/components/`](src/components/)
5. Update navigation in [`AppLayout.tsx`](src/components/AppLayout.tsx) and routes in [`App.tsx`](src/App.tsx)

### Adding shadcn/ui Components
Use `shadcn` CLI (installed as dev dependency):
```bash
bunx shadcn@latest add [component-name]
```

### Date Formatting
- Use `date-fns` library: `format(date, 'PPP')` for display
- Calendar component: `react-day-picker` (wrapped in [`ui/calendar.tsx`](src/components/ui/calendar.tsx))

## Important Notes
- **No backend yet**: All data in localStorage, cleared on browser data wipe
- **Form validation**: Zod schemas with `react-hook-form` + `@hookform/resolvers`
- **Icons**: `lucide-react` (see [`AppLayout.tsx`](src/components/AppLayout.tsx) for icon imports)
- **Toast notifications**: Use `<Toaster />` in [`App.tsx`](src/App.tsx), call `toast()` from `sonner`
