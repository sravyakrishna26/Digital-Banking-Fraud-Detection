import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountStatusBadgeProps {
  status: 'ACTIVE' | 'BLOCKED' | null | undefined;
  unblockAt?: string;
}

const AccountStatusBadge = ({ status, unblockAt }: AccountStatusBadgeProps) => {
  // Always show badge if status is provided
  if (!status) {
    return null;
  }

  const getStatusConfig = () => {
    if (status === 'BLOCKED') {
      return {
        className: "bg-destructive/10 text-destructive border-destructive/20",
        icon: XCircle,
        label: "BLOCKED",
      };
    }
    return {
      className: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
      icon: CheckCircle2,
      label: "ACTIVE",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatUnblockTime = (unblockAt: string) => {
    try {
      const date = new Date(unblockAt);
      return date.toLocaleString();
    } catch {
      return unblockAt;
    }
  };

  return (
    <div className="space-y-1.5">
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-semibold shadow-sm",
        config.className
      )}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </div>
      {status === 'BLOCKED' && unblockAt && (
        <div className="text-xs text-muted-foreground font-medium">
          Unblock at: {formatUnblockTime(unblockAt)}
        </div>
      )}
    </div>
  );
};

export default AccountStatusBadge;