import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

const IncomeExpenseChart = () => {
  const { filteredTransactions: transactions } = useFinance();

  const data = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of transactions) {
      const month = format(parseISO(t.date), "MMM yyyy");
      const entry = map.get(month) || { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(month, entry);
    }
    return Array.from(map.entries())
      .map(([month, vals]) => ({
        month,
        income: Math.round(vals.income * 100) / 100,
        expense: Math.round(vals.expense * 100) / 100,
      }))
      .reverse();
  }, [transactions]);

  return (
    <div
      className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in"
      style={{ animationDelay: "350ms" }}
    >
      <h3 className="font-display font-semibold text-sm mb-4">
        Income vs Expenses
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                fontSize: 13,
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) =>
                value.charAt(0).toUpperCase() + value.slice(1)
              }
            />
            <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
