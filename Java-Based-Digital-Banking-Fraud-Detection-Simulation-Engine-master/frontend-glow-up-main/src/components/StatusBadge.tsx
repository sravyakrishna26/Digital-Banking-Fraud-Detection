import { Check, X, Clock, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | null | undefined;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: string | null | undefined) => {
    if (!status) {
      return {
        className: "status-neutral",
        icon: HelpCircle,
        label: "UNKNOWN",
      };
    }

    const upperStatus = status.toUpperCase();
    
    switch (upperStatus) {
      case "SUCCESS":
        return {
          className: "status-success",
          icon: Check,
          label: "SUCCESS",
        };
      case "FAILED":
        return {
          className: "status-danger",
          icon: X,
          label: "FAILED",
        };
      case "PENDING":
        return {
          className: "status-warning",
          icon: Clock,
          label: "PENDING",
        };
      default:
        return {
          className: "status-neutral",
          icon: HelpCircle,
          label: status.toUpperCase(),
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={cn("status-badge", config.className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
