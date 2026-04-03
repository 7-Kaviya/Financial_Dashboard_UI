import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";

export type Role = "admin" | "viewer";
export type TransactionType = "income" | "expense";
export type Category = "Food" | "Transport" | "Shopping" | "Entertainment" | "Salary" | "Freelance" | "Utilities" | "Health" | "Education" | "Other";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
}

export interface Filters {
  search: string;
  type: TransactionType | "all";
  category: Category | "all";
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  groupBy: "none" | "category" | "type" | "month";
}

interface FinanceContextType {
  role: Role;
  setRole: (r: Role) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  editTransaction: (id: string, t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredTransactions: Transaction[];
  exportData: (format: "csv" | "json") => void;
}

const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Entertainment", "Salary", "Freelance", "Utilities", "Health", "Education", "Other"];

const STORAGE_KEY = "fintrack-transactions";
const ROLE_KEY = "fintrack-role";

const generateMockData = (): Transaction[] => {
  const descriptions: Record<Category, string[]> = {
    Food: ["Grocery Store", "Restaurant Dinner", "Coffee Shop", "Food Delivery", "Lunch Out"],
    Transport: ["Uber Ride", "Gas Station", "Bus Pass", "Parking Fee", "Train Ticket"],
    Shopping: ["Amazon Order", "Clothing Store", "Electronics", "Home Depot", "Online Purchase"],
    Entertainment: ["Netflix", "Movie Tickets", "Concert", "Gaming", "Spotify"],
    Salary: ["Monthly Salary", "Bonus Payment", "Commission"],
    Freelance: ["Design Project", "Consulting Fee", "Writing Gig", "Dev Contract"],
    Utilities: ["Electricity Bill", "Water Bill", "Internet", "Phone Bill"],
    Health: ["Pharmacy", "Gym Membership", "Doctor Visit", "Insurance"],
    Education: ["Online Course", "Books", "Workshop", "Certification"],
    Other: ["Gift", "Donation", "Miscellaneous"],
  };

  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const isIncome = Math.random() < 0.3;
    const category: Category = isIncome
      ? (Math.random() < 0.7 ? "Salary" : "Freelance")
      : CATEGORIES.filter(c => c !== "Salary" && c !== "Freelance")[Math.floor(Math.random() * 8)];

    const descs = descriptions[category];
    const description = descs[Math.floor(Math.random() * descs.length)];
    const amount = isIncome
      ? Math.round((2000 + Math.random() * 6000) * 100) / 100
      : Math.round((5 + Math.random() * 500) * 100) / 100;

    transactions.push({
      id: crypto.randomUUID(),
      date: date.toISOString().split("T")[0],
      description,
      amount,
      type: isIncome ? "income" : "expense",
      category,
    });
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
};

const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return generateMockData();
};

const loadRole = (): Role => {
  try {
    const stored = localStorage.getItem(ROLE_KEY);
    if (stored === "admin" || stored === "viewer") return stored;
  } catch {}
  return "admin";
};

const FinanceContext = createContext<FinanceContextType | null>(null);

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};

export const CATEGORY_LIST = CATEGORIES;

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(loadRole);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
    category: "all",
    sortBy: "date",
    sortOrder: "desc",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    groupBy: "none",
  });

  // Persist transactions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Persist role
  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    localStorage.setItem(ROLE_KEY, r);
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions(prev => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const editTransaction = useCallback((id: string, t: Omit<Transaction, "id">) => {
    setTransactions(prev => prev.map(tx => (tx.id === id ? { ...t, id } : tx)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(t => t.description.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    }
    if (filters.type !== "all") result = result.filter(t => t.type === filters.type);
    if (filters.category !== "all") result = result.filter(t => t.category === filters.category);
    if (filters.dateFrom) result = result.filter(t => t.date >= filters.dateFrom);
    if (filters.dateTo) result = result.filter(t => t.date <= filters.dateTo);
    if (filters.amountMin) result = result.filter(t => t.amount >= parseFloat(filters.amountMin));
    if (filters.amountMax) result = result.filter(t => t.amount <= parseFloat(filters.amountMax));

    result.sort((a, b) => {
      const mul = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "date") return mul * a.date.localeCompare(b.date);
      return mul * (a.amount - b.amount);
    });
    return result;
  }, [transactions, filters]);

  const exportData = useCallback((format: "csv" | "json") => {
    const data = filteredTransactions;
    let content: string;
    let mimeType: string;
    let ext: string;

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      ext = "json";
    } else {
      const headers = ["Date", "Description", "Amount", "Type", "Category"];
      const rows = data.map(t => [t.date, `"${t.description}"`, t.amount, t.type, t.category].join(","));
      content = [headers.join(","), ...rows].join("\n");
      mimeType = "text/csv";
      ext = "csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-transactions.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  return (
    <FinanceContext.Provider value={{ role, setRole, transactions, addTransaction, editTransaction, deleteTransaction, filters, setFilters, filteredTransactions, exportData }}>
      {children}
    </FinanceContext.Provider>
  );
};
