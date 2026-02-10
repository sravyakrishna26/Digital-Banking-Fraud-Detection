import { ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FraudBadgeProps {
  fraudFlag: boolean | number;
  fraudReason?: string | null;
}

const FraudBadge = ({ fraudFlag, fraudReason }: FraudBadgeProps) => {
  const isFraud = fraudFlag === true || fraudFlag === 1;

  if (!isFraud) {
    return (
      <span className="status-badge status-success">
        <ShieldCheck className="w-3.5 h-3.5" />
        Safe
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="status-badge status-danger">
        <AlertTriangle className="w-3.5 h-3.5" />
        Fraud Alert
      </span>
      {fraudReason && fraudReason !== "NONE" && (
        <div className="text-xs text-warning bg-warning-muted border-l-2 border-warning px-2 py-1.5 rounded-r-md">
          <span className="font-semibold">Reason:</span> {fraudReason}
        </div>
      )}
    </div>
  );
};

export default FraudBadge;
