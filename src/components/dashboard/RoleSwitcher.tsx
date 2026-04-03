import { useFinance, type Role } from "@/context/FinanceContext";
import { Shield, Eye } from "lucide-react";

const RoleSwitcher = () => {
  const { role, setRole } = useFinance();

  const roles: { value: Role; label: string; icon: typeof Shield }[] = [
    { value: "admin", label: "Admin", icon: Shield },
    { value: "viewer", label: "Viewer", icon: Eye },
  ];

  return (
    <div className="flex items-center bg-secondary rounded-lg p-1 gap-1">
      {roles.map(r => (
        <button
          key={r.value}
          onClick={() => setRole(r.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            role === r.value
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <r.icon className="w-3.5 h-3.5" />
          {r.label}
        </button>
      ))}
    </div>
  );
};

export default RoleSwitcher;
