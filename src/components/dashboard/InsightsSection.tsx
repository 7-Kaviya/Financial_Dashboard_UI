import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Lightbulb, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

const InsightsSection = () => {
  const { transactions } = useFinance();

  const insights = useMemo(() => {
    if (transactions.length === 0) return [];

    // Highest spending category
    const catMap = new Map<string, number>();
    let totalExpense = 0;
    for (const t of transactions) {
      if (t.type === "expense") {
        catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
        totalExpense += t.amount;
      }
    }
    const topCategory = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0];

    // Monthly comparison
    const now = new Date();
    const thisMonth = now.getMonth(), thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthExp = transactions.filter(t => { const d = new Date(t.date); return t.type === "expense" && d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, t) => s + t.amount, 0);
    const lastMonthExp = transactions.filter(t => { const d = new Date(t.date); return t.type === "expense" && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear; }).reduce((s, t) => s + t.amount, 0);

    const monthDiff = lastMonthExp > 0 ? ((thisMonthExp - lastMonthExp) / lastMonthExp * 100) : 0;

    // Average transaction
    const avgExpense = totalExpense / (transactions.filter(t => t.type === "expense").length || 1);

    const result = [];

    if (topCategory) {
      result.push({
        icon: BarChart3,
        title: "Highest Spending",
        description: `${topCategory[0]} accounts for ${((topCategory[1] / totalExpense) * 100).toFixed(0)}% of your expenses ($${topCategory[1].toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`,
        color: "text-chart-4",
        bg: "bg-orange-50",
      });
    }

    result.push({
      icon: monthDiff <= 0 ? TrendingDown : TrendingUp,
      title: "Monthly Comparison",
      description: monthDiff <= 0
        ? `Spending is down ${Math.abs(monthDiff).toFixed(0)}% compared to last month. Keep it up!`
        : `Spending is up ${monthDiff.toFixed(0)}% compared to last month. Consider reviewing your budget.`,
      color: monthDiff <= 0 ? "text-income" : "text-expense",
      bg: monthDiff <= 0 ? "bg-income-muted" : "bg-expense-muted",
    });

    result.push({
      icon: Lightbulb,
      title: "Average Expense",
      description: `Your average expense transaction is $${avgExpense.toFixed(2)}. Transactions over $${(avgExpense * 2).toFixed(0)} may need attention.`,
      color: "text-primary",
      bg: "bg-secondary",
    });

    return result;
  }, [transactions]);

  if (insights.length === 0) return null;

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <h3 className="font-display font-semibold text-sm mb-4">Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.bg}`}>
              <insight.icon className={`w-4 h-4 ${insight.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsSection;
