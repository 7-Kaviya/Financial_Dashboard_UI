import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const BalanceTrendChart = () => {
  const { transactions } = useFinance();

  const data = useMemo(() => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    const now = new Date();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { income: 0, expense: 0 });
    }

    // Aggregate transactions
    for (const t of transactions) {
      const key = t.date.substring(0, 7);
      if (monthlyMap.has(key)) {
        const entry = monthlyMap.get(key)!;
        if (t.type === "income") entry.income += t.amount;
        else entry.expense += t.amount;
      }
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let balance = 0;

    return Array.from(monthlyMap.entries()).map(([key, val]) => {
      balance += val.income - val.expense;
      const monthIdx = parseInt(key.split("-")[1]) - 1;

      return {
        name: months[monthIdx],
        income: Math.round(val.income),
        expenses: Math.round(val.expense),
        balance: Math.round(balance)
      };
    });
  }, [transactions]);

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="font-display font-semibold text-sm mb-4">Balance Trend</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            {/* Gradients */}
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />

            {/* Axes */}
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="hsl(220, 9%, 46%)"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(220, 13%, 91%)",
                fontSize: 13
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />

            {/* ✅ Legend Added */}
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
            />

            {/* Areas */}
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(160, 84%, 39%)"
              fill="url(#incomeGrad)"
              strokeWidth={2}
              name="Income"
            />

            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(0, 72%, 51%)"
              fill="url(#expenseGrad)"
              strokeWidth={2}
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BalanceTrendChart;