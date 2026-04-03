import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--income))",
  "hsl(var(--expense))",
  "hsl(37, 90%, 51%)",
  "hsl(262, 52%, 47%)",
  "hsl(200, 70%, 50%)",
  "hsl(340, 65%, 47%)",
  "hsl(80, 60%, 40%)",
];

interface TreeNode {
  name: string;
  size: number;
  fill: string;
}

const CustomContent = (props: any) => {
  const { x, y, width, height, name, size, fill } = props;
  if (!width || !height || width < 30 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        style={{ fill: fill || "#888", stroke: "hsl(var(--background))", strokeWidth: 2 }}
      />
      {width > 50 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-xs font-semibold"
            style={{ fontSize: Math.min(13, width / 8) }}
          >
            {name ?? ""}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white/80 text-xs"
            style={{ fontSize: Math.min(11, width / 10) }}
          >
            ${(size ?? 0).toLocaleString()}
          </text>
        </>
      )}
    </g>
  );
};

const SpendingTreemap = () => {
  const { transactions } = useFinance();

  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === "expense") {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      }
    }
    return Array.from(map.entries())
      .map(([name, value], i): TreeNode => ({
        name,
        size: Math.round(value * 100) / 100,
        fill: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.size - a.size);
  }, [transactions]);

  if (!data.length) return null;

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="font-display font-semibold text-sm mb-4">Spending Treemap</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            nameKey="name"
            content={<CustomContent />}
          >
            <Tooltip
              formatter={(value: any) => [`$${(value ?? 0).toLocaleString()}`, "Amount"]}
              contentStyle={{ borderRadius: "0.75rem", fontSize: 13 }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingTreemap;
