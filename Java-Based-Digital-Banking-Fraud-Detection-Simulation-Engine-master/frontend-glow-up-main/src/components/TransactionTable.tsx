import { useState, useMemo } from "react";
import StatusBadge from "./StatusBadge";
import FraudBadge from "./FraudBadge";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowUpDown, Loader2, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  transactionId?: string;
  amount?: number;
  currency?: string;
  senderAccount?: string;
  receiverAccount?: string;
  status?: string;
  fraudFlag?: boolean | number;
  fraudReason?: string;
  timestamp?: string;
  timestampVal?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

type SortKey = "transactionId" | "amount" | "status" | "timestamp";

const TransactionTable = ({ transactions, loading, error }: TransactionTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (txn) =>
          txn.transactionId?.toLowerCase().includes(term) ||
          txn.senderAccount?.toLowerCase().includes(term) ||
          txn.receiverAccount?.toLowerCase().includes(term) ||
          txn.amount?.toString().includes(term)
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Transaction];
        let bVal: any = b[sortConfig.key as keyof Transaction];

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal?.toLowerCase() || "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [transactions, searchTerm, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return "N/A";
    return `${currency || ""} ${parseFloat(String(amount)).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn(
            "w-3.5 h-3.5 transition-colors",
            sortConfig.key === sortKey ? "text-accent" : "text-muted-foreground/50"
          )}
        />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="card-elevated p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-danger-muted flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
          <p className="text-danger font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card-elevated p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No transactions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Transactions ({filteredAndSortedTransactions.length})
        </h3>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by ID, Account, or Amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 form-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1">
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label="Transaction ID" sortKey="transactionId" />
              <SortHeader label="Amount" sortKey="amount" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Currency
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sender
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Receiver
              </th>
              <SortHeader label="Status" sortKey="status" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fraud Flag
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fraud Reason
              </th>
              <SortHeader label="Timestamp" sortKey="timestamp" />
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.map((txn, index) => {
              const isFraud = txn.fraudFlag === true || txn.fraudFlag === 1;
              return (
                <tr
                  key={txn.transactionId || index}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    isFraud ? "fraud-row" : "hover:bg-muted/30"
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="mono-text text-accent">{txn.transactionId || "N/A"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-success">
                      {formatAmount(txn.amount, txn.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{txn.currency || "N/A"}</td>
                  <td className="px-4 py-3">
                    <span className="mono-text text-sm">{txn.senderAccount || "N/A"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mono-text text-sm">{txn.receiverAccount || "N/A"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={txn.status} />
                  </td>
                  <td className="px-4 py-3">
                    <FraudBadge fraudFlag={isFraud} />
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {txn.fraudReason && txn.fraudReason !== "NONE" ? (
                      <span className="text-xs text-warning bg-warning-muted px-2 py-1 rounded">
                        {txn.fraudReason}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(txn.timestamp || txn.timestampVal)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
