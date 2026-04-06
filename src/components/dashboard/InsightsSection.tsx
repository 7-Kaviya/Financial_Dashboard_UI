import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Wallet, BarChart3, Target } from "lucide-react";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142 71% 45%)",
  "hsl(262 83% 58%)",
  "hsl(0 84% 60%)",
];

const InsightsSection = () => {
  const { transactions } = useFinance();

  const data = useMemo(() => {
    if (transactions.length === 0) return null;

    // Category breakdown
    const catMap = new Map<string, number>();
    let totalExpense = 0;
    let totalIncome = 0;
    for (const t of transactions) {
      if (t.type === "expense") {
        catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
        totalExpense += t.amount;
      } else {
        totalIncome += t.amount;
      }
    }
    const topCategories = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value: Math.round(value * 100) / 100, fill: COLORS[i % COLORS.length] }));

    // Monthly data
    const monthMap = new Map<string, { income: number; expense: number }>();
    for (const t of transactions) {
      const key = t.date.substring(0, 7);
      const entry = monthMap.get(key) || { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      monthMap.set(key, entry);
    }
    const monthlyData = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => {
        const [y, m] = key.split("-");
        const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString("default", { month: "short" });
        return { name: monthName, income: Math.round(val.income), expense: Math.round(val.expense), savings: Math.round(val.income - val.expense) };
      });

    // Current vs last month
    const now = new Date();
    const thisMonth = now.getMonth(), thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const thisMonthExp = transactions.filter(t => { const d = new Date(t.date); return t.type === "expense" && d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, t) => s + t.amount, 0);
    const lastMonthExp = transactions.filter(t => { const d = new Date(t.date); return t.type === "expense" && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear; }).reduce((s, t) => s + t.amount, 0);
    const monthDiff = lastMonthExp > 0 ? ((thisMonthExp - lastMonthExp) / lastMonthExp * 100) : 0;

    // Average expense
    const expenseTx = transactions.filter(t => t.type === "expense");
    const avgExpense = expenseTx.length > 0 ? totalExpense / expenseTx.length : 0;
    const highSpendTx = expenseTx.filter(t => t.amount > avgExpense * 1.5).length;

    // Savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
    const savingsGauge = [{ name: "Savings", value: Math.min(Math.max(savingsRate, 0), 100), fill: "hsl(var(--chart-2))" }];

    return { topCategories, monthlyData, totalExpense, totalIncome, monthDiff, thisMonthExp, lastMonthExp, avgExpense, highSpendTx, savingsRate, savingsGauge };
  }, [transactions]);

  if (!data) return <p className="text-muted-foreground text-center py-12">No data available.</p>;

  const statCards = [
    {
      icon: data.monthDiff <= 0 ? TrendingDown : TrendingUp,
      label: "Monthly Trend",
      value: `${data.monthDiff <= 0 ? "↓" : "↑"} ${Math.abs(data.monthDiff).toFixed(1)}%`,
      sub: data.monthDiff <= 0 ? "Less spending than last month" : "More spending than last month",
      color: data.monthDiff <= 0 ? "text-income" : "text-expense",
      bg: data.monthDiff <= 0 ? "bg-income-muted" : "bg-expense-muted",
    },
    {
      icon: Wallet,
      label: "Avg Expense",
      value: `$${data.avgExpense.toFixed(0)}`,
      sub: `${data.highSpendTx} transaction${data.highSpendTx !== 1 ? "s" : ""} above 1.5× average`,
      color: "text-chart-4",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: Target,
      label: "Savings Rate",
      value: `${data.savingsRate.toFixed(1)}%`,
      sub: data.savingsRate >= 20 ? "Healthy savings rate!" : "Try to save at least 20%",
      color: data.savingsRate >= 20 ? "text-income" : "text-chart-4",
      bg: data.savingsRate >= 20 ? "bg-income-muted" : "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: AlertTriangle,
      label: "Top Category",
      value: data.topCategories[0]?.name || "N/A",
      sub: data.topCategories[0] ? `$${data.topCategories[0].value.toLocaleString()} (${((data.topCategories[0].value / data.totalExpense) * 100).toFixed(0)}% of expenses)` : "",
      color: "text-primary",
      bg: "bg-secondary",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
            </div>
            <p className="text-xl font-bold font-display">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Savings rate gauge and month-over-month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50">
          <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" /> Savings Rate Gauge
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Target: 20% or more of income saved</p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                startAngle={180}
                endAngle={0}
                data={data.savingsGauge}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  background={{ fill: "hsl(var(--secondary))" }}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground font-display font-bold"
                  fontSize={28}
                >
                  {data.savingsRate.toFixed(1)}%
                </text>
                <text
                  x="50%"
                  y="62%"
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={11}
                >
                  savings rate
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Month over month comparison */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50">
          <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
            {data.monthDiff <= 0 ? <TrendingDown className="w-4 h-4 text-income" /> : <TrendingUp className="w-4 h-4 text-expense" />}
            Month-over-Month
          </h3>
          <p className="text-xs text-muted-foreground mb-6">Comparing current month expenses to last month</p>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Last Month</span>
                <span className="text-sm font-semibold">${data.lastMonthExp.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full h-4 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-muted-foreground/40 transition-all duration-700"
                  style={{ width: `${Math.min((data.lastMonthExp / Math.max(data.lastMonthExp, data.thisMonthExp, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-sm font-semibold">${data.thisMonthExp.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full h-4 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${data.monthDiff <= 0 ? "bg-income" : "bg-expense"}`}
                  style={{ width: `${Math.min((data.thisMonthExp / Math.max(data.lastMonthExp, data.thisMonthExp, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className={`text-center py-3 rounded-lg ${data.monthDiff <= 0 ? "bg-income-muted" : "bg-expense-muted"}`}>
              <p className={`text-lg font-bold font-display ${data.monthDiff <= 0 ? "text-income" : "text-expense"}`}>
                {data.monthDiff <= 0 ? "↓" : "↑"} {Math.abs(data.monthDiff).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.monthDiff <= 0 ? "You're spending less — great job!" : "Consider reviewing your budget."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;
