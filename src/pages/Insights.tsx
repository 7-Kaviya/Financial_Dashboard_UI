import InsightsSection from "@/components/dashboard/InsightsSection";
import { LayoutDashboard, Moon, Sun, ArrowLeft } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Insights = () => {
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
            <Button variant="ghost" size="sm" asChild className="h-8">
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <InsightsSection />
      </main>
    </div>
  );
};

export default Insights;
