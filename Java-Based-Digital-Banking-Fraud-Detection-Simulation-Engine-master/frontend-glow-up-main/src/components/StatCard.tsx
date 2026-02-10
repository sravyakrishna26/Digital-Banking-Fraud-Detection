import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  variant?: "default" | "success" | "danger" | "warning" | "info";
}

const StatCard = ({ icon: Icon, value, label, variant = "default" }: StatCardProps) => {
  const iconBgColors = {
    default: "bg-muted",
    success: "bg-success-muted",
    danger: "bg-danger-muted",
    warning: "bg-warning-muted",
    info: "bg-accent/10",
  };

  const iconColors = {
    default: "text-muted-foreground",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
    info: "text-accent",
  };

  return (
    <div className="stat-card group">
      <div
        className={cn(
          "stat-icon transition-transform group-hover:scale-110",
          iconBgColors[variant]
        )}
      >
        <Icon className={cn("w-6 h-6", iconColors[variant])} />
      </div>
      <div className="flex-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
