# Finalysis — Finance Dashboard

A modern, interactive finance dashboard . It showcases clean UI/UX, robust state management, and modular component architecture for tracking income, expenses, and financial insights.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4) ![Vite](https://img.shields.io/badge/Vite-5-646CFF)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd financial dashboard ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Other Commands

| Command | Description |
|---|---|
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests (Vitest) |
| `npm run lint` | Run ESLint |

---

##  Approach & Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Charts | Recharts |
| Routing | React Router v6 |
| State | React Context + hooks |
| Testing | Vitest + Playwright |

### Architecture Decisions

- **Centralized State via Context** — A single `FinanceContext` manages transactions, filters, and roles, providing a clean API (`useFinance()`) to all dashboard components. This avoids prop drilling and keeps data flow predictable.

- **Filter-Driven Reactivity** — Visualizations (Balance Trend, Income vs Expenses) consume `filteredTransactions` from context, so applying any filter in the transactions table instantly updates charts across the dashboard.

- **Component Modularity** — Each dashboard section (summary cards, charts, transactions table) is a self-contained component with its own data derivation via `useMemo`, keeping rendering efficient and concerns separated.

- **Design System Tokens** — Colors, fonts, and radii are defined as CSS custom properties in `index.css` and mapped through `tailwind.config.ts`, enabling consistent theming and dark mode via a single class toggle.

- **Local Persistence** — Transactions and role selection persist to `localStorage`, so data survives page refreshes without requiring a backend.

---

##  Features

###  Dashboard Visualizations

- **Summary Cards** — At-a-glance totals for income, expenses and net balance.
- **Balance Trend Chart** — Area chart showing monthly income vs. expenses over the last 6 months.
- **Spending Breakdown** — Donut chart with per-category expense totals and percentages.
- **Income vs Expenses** — Bar chart comparing monthly income and expenses side by side.
- **Spending Treemap** — Proportional treemap visualization of expense categories.

###  Transactions Management

- **Searchable Table** — Full-text search across descriptions and categories.
- **Advanced Filters** — Filter by type (income/expense), category, date range, and amount range.
- **Sorting** — Sort by date or amount, ascending or descending.
- **Grouping** — Group transactions by category, type, or month.
- **CRUD Operations** — Add, edit, and delete transactions (admin role only).
- **Export** — Download filtered data as CSV or JSON.

###  Insights Section

- **Top Spending Category**
- **Monthly Comparison**  
- **Average Expense Gauge** 

###  UI / UX

- **Dark / Light Mode** — Toggle between themes; preference persists across sessions.
- **Role Switcher** — Switch between Admin (full CRUD) and Viewer (read-only) roles.
- **Responsive Layout** — Adapts from mobile to desktop with a grid-based layout.
- **Animations** — Fade-in and slide-in transitions for a polished feel.

---

##  Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard feature components
│   │   ├── SummaryCards.tsx
│   │   ├── BalanceTrendChart.tsx
│   │   ├── SpendingBreakdown.tsx
│   │   ├── SpendingTreemap.tsx
│   │   ├── IncomeExpenseChart.tsx
│   │   ├── TransactionsTable.tsx
│   │   ├── TransactionModal.tsx
│   │   ├── InsightsSection.tsx
│   │   └── RoleSwitcher.tsx
│   └── ui/                 # Reusable shadcn/ui primitives
├── context/
│   └── FinanceContext.tsx   # Global state: transactions, filters, roles
├── hooks/
│   ├── use-theme.ts        # Dark/light mode toggle
│   └── use-mobile.tsx      # Responsive breakpoint detection
├── pages/
│   ├── Index.tsx            # Main dashboard page
│   └── NotFound.tsx         # 404 fallback
├── lib/
│   └── utils.ts             # Utility helpers (cn, etc.)
├── index.css                # Tailwind base + design tokens
└── main.tsx                 # App entry point
```