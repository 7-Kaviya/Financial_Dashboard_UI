import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

const SummaryCards = () => {
  const { transactions } = useFinance();

  const { totalBalance, totalIncome, totalExpenses, incomeChange, expenseChange } = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let income = 0, expenses = 0, lastIncome = 0, lastExpenses = 0;
    for (const t of transactions) {
      const d = new Date(t.date);
      const m = d.getMonth(), y = d.getFullYear();
      if (t.type === "income") {
        income += t.amount;
        if (m === thisMonth && y === thisYear) { /* current */ }
        if (m === lastMonth && y === lastMonthYear) lastIncome += t.amount;
        if (m === thisMonth && y === thisYear) income = income; // just summing all
      } else {
        expenses += t.amount;
        if (m === lastMonth && y === lastMonthYear) lastExpenses += t.amount;
      }
    }

    // Simplified: compare current month totals to last month
    const currentMonthIncome = transactions.filter(t => { const d = new Date(t.date); return t.type === "income" && d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, t) => s + t.amount, 0);
    const currentMonthExpenses = transactions.filter(t => { const d = new Date(t.date); return t.type === "expense" && d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, t) => s + t.amount, 0);

    const incomeChange = lastIncome > 0 ? ((currentMonthIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses > 0 ? ((currentMonthExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    return { totalBalance: income - expenses, totalIncome: income, totalExpenses: expenses, incomeChange, expenseChange };
  }, [transactions]);

  const cards = [
    {
      label: "Total Balance",
      value: totalBalance,
      icon: Wallet,
      className: "bg-primary text-primary-foreground",
      iconBg: "bg-primary-foreground/20",
      change: null,
    },
    {
      label: "Total Income",
      value: totalIncome,
      icon: TrendingUp,
      className: "bg-card text-card-foreground",
      iconBg: "bg-income-muted",
      iconColor: "text-income",
      change: incomeChange,
      positive: true,
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      icon: TrendingDown,
      className: "bg-card text-card-foreground",
      iconBg: "bg-expense-muted",
      iconColor: "text-expense",
      change: expenseChange,
      positive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`rounded-xl p-5 shadow-sm border border-border/50 ${card.className} animate-fade-in`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-80">{card.label}</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconBg}`}>
              <card.icon className={`w-4 h-4 ${card.iconColor || ""}`} />
            </div>
          </div>
          <div className="text-2xl font-display font-bold tracking-tight">
            ${card.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {card.change !== null && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              {card.change >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-income" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-expense" />
              )}
              <span className={card.change >= 0 ? "text-income" : "text-expense"}>
                {Math.abs(card.change).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
