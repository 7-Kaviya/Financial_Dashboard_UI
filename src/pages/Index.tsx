import { FinanceProvider } from "@/context/FinanceContext";
import SummaryCards from "@/components/dashboard/SummaryCards";
import BalanceTrendChart from "@/components/dashboard/BalanceTrendChart";
import SpendingBreakdown from "@/components/dashboard/SpendingBreakdown";
import SpendingTreemap from "@/components/dashboard/SpendingTreemap";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import InsightsSection from "@/components/dashboard/InsightsSection";
import RoleSwitcher from "@/components/dashboard/RoleSwitcher";
import { LayoutDashboard, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-lg">FinTrack</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <RoleSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <SummaryCards />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <BalanceTrendChart />
          </div>
          <div className="lg:col-span-2">
            <SpendingBreakdown />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart />
          <SpendingTreemap />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionsTable />
          </div>
          <div>
            <InsightsSection />
          </div>
        </div>
      </main>
    </div>
  );
};

const Index = () => (
  <FinanceProvider>
    <Dashboard />
  </FinanceProvider>
);

export default Index;
