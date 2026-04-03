import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(222, 47%, 11%)",
  "hsl(160, 84%, 39%)",
  "hsl(0, 72%, 51%)",
  "hsl(37, 90%, 51%)",
  "hsl(262, 52%, 47%)",
  "hsl(200, 70%, 50%)",
  "hsl(340, 65%, 47%)",
  "hsl(80, 60%, 40%)",
];

const SpendingBreakdown = () => {
  const { transactions } = useFinance();

  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === "expense") {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      }
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="font-display font-semibold text-sm mb-4">Spending Breakdown</h3>
      <div className="flex flex-col items-center">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} contentStyle={{ borderRadius: "0.75rem", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full mt-3 space-y-2">
          {data.slice(0, 5).map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">${d.value.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">({((d.value / total) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingBreakdown;
