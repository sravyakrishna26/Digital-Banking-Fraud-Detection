import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Loader2, Send, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import AccountStatusBadge from "./AccountStatusBadge";
import { getAccountStatus, type AccountStatus } from "@/services/transactionApi";
import { isAuthenticated } from "@/services/authApi";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionFormProps {
  onTransactionSubmitted?: () => void;
}

interface FormData {
  transactionId: string;
  amount: string;
  currency: string;
  senderAccount: string;
  receiverAccount: string;
  transactionType: string;
  channel: string;
  ipAddress: string;
  location: string;
}

const initialFormData: FormData = {
  transactionId: "",
  amount: "",
  currency: "INR",
  senderAccount: "",
  receiverAccount: "",
  transactionType: "TRANSFER",
  channel: "MOBILE",
  ipAddress: "",
  location: "",
};

const currencies = ["INR", "USD", "EUR", "GBP"];
const transactionTypes = ["TRANSFER", "WITHDRAW", "DEPOSIT", "PAYMENT"];
const channels = ["MOBILE", "ATM", "CARD", "NETBANKING"];

const TransactionForm = ({ onTransactionSubmitted }: TransactionFormProps) => {
  const { authenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: "", text: "" });
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [checkingAccountStatus, setCheckingAccountStatus] = useState(false);
  const accountCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check account status when sender account changes
  useEffect(() => {
    // Clear existing timeout
    if (accountCheckTimeoutRef.current) {
      clearTimeout(accountCheckTimeoutRef.current);
    }

    // Reset status if sender account is cleared
    if (!formData.senderAccount || formData.senderAccount.trim() === "") {
      setAccountStatus(null);
      setCheckingAccountStatus(false);
      return;
    }

    // Set default ACTIVE status immediately (optimistic UI)
    // This ensures badge shows right away
    setAccountStatus({
      accountNumber: formData.senderAccount.trim(),
      status: 'ACTIVE',
      failedCountLast5Min: 0
    });

    // Only check account status if user is authenticated
    if (!authenticated || !isAuthenticated()) {
      // Keep default ACTIVE status even if not authenticated
      return;
    }

    // Debounce account status check (wait 500ms after user stops typing)
    accountCheckTimeoutRef.current = setTimeout(async () => {
      setCheckingAccountStatus(true);
      try {
        const result = await getAccountStatus(formData.senderAccount.trim());
        if (result.success && result.data) {
          console.log('Account status fetched:', result.data);
          setAccountStatus(result.data);
        } else {
          // Log error for debugging
          console.warn('Failed to fetch account status:', result.error);
          // Keep default ACTIVE status on error
        }
      } catch (error) {
        console.error('Error fetching account status:', error);
        // Keep default ACTIVE status on error
      } finally {
        setCheckingAccountStatus(false);
      }
    }, 500);

    return () => {
      if (accountCheckTimeoutRef.current) {
        clearTimeout(accountCheckTimeoutRef.current);
      }
    };
  }, [formData.senderAccount, authenticated]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validate required fields
    if (!formData.transactionId || !formData.amount || !formData.senderAccount || !formData.receiverAccount) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      setLoading(false);
      return;
    }

    // Check if account is blocked
    if (accountStatus?.status === 'BLOCKED') {
      setMessage({
        type: "error",
        text: "This account is blocked. Transactions cannot be processed until the account is unblocked."
      });
      setLoading(false);
      return;
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Amount must be a positive number" });
      setLoading(false);
      return;
    }

    // Prepare transaction data for API
    // Generate timestamp in format: yyyy-MM-dd HH:mm:ss
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

    const transactionData = {
      transactionId: formData.transactionId,
      timestamp: timestamp,
      amount: amount,
      currency: formData.currency,
      senderAccount: formData.senderAccount,
      receiverAccount: formData.receiverAccount,
      transactionType: formData.transactionType,
      channel: formData.channel,
      ipAddress: formData.ipAddress || undefined,
      location: formData.location || undefined,
    };

    // Call API
    try {
      const { createTransaction } = await import("@/services/transactionApi");
      const result = await createTransaction(transactionData);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.data || "Transaction submitted successfully!",
        });

        setFormData(initialFormData);

        if (onTransactionSubmitted) {
          onTransactionSubmitted();
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to submit transaction. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="w-full">
      <div className="card-elevated p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Submit New Transaction</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the transaction details below. Status will be determined automatically by the system.
          </p>
        </div>

        {message.text && (
          <div
            className={cn(
              "alert mb-6 animate-fade-in",
              message.type === "success" ? "alert-success" : "alert-error"
            )}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Transaction ID & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="transactionId" className="form-label">
                Transaction ID <span className="form-required">*</span>
              </Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => handleChange("transactionId", e.target.value)}
                placeholder="e.g., TXN123456789"
                className="form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="form-label">
                Amount <span className="form-required">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Row 2: Currency & Transaction Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="currency" className="form-label">
                Currency <span className="form-required">*</span>
              </Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionType" className="form-label">
                Transaction Type <span className="form-required">*</span>
              </Label>
              <Select value={formData.transactionType} onValueChange={(value) => handleChange("transactionType", value)}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  {transactionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Sender & Receiver Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senderAccount" className="form-label">
                  Sender Account <span className="form-required">*</span>
                </Label>
                {checkingAccountStatus && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <Input
                id="senderAccount"
                value={formData.senderAccount}
                onChange={(e) => handleChange("senderAccount", e.target.value)}
                placeholder="e.g., AC12345678"
                className={cn(
                  "form-input",
                  accountStatus?.status === 'BLOCKED' && "border-destructive focus-visible:ring-destructive"
                )}
                required
              />
              {formData.senderAccount.trim() && (
                <div className="mt-2">
                  {checkingAccountStatus ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking account status...</span>
                    </div>
                  ) : accountStatus ? (
                    <>
                      <AccountStatusBadge
                        status={accountStatus.status}
                        unblockAt={accountStatus.unblockAt}
                      />
                      {accountStatus.failedCountLast5Min !== undefined && accountStatus.failedCountLast5Min > 0 && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Failed attempts (last 5 min): {accountStatus.failedCountLast5Min}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Enter account number to check status
                    </div>
                  )}
                </div>
              )}
              {accountStatus?.status === 'BLOCKED' && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-destructive">
                    This account is blocked. Transactions cannot be processed until {accountStatus.unblockAt ? new Date(accountStatus.unblockAt).toLocaleString() : 'the block period expires'}.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverAccount" className="form-label">
                Receiver Account <span className="form-required">*</span>
              </Label>
              <Input
                id="receiverAccount"
                value={formData.receiverAccount}
                onChange={(e) => handleChange("receiverAccount", e.target.value)}
                placeholder="e.g., AC87654321"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Row 4: Channel & IP Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="channel" className="form-label">
                Channel <span className="form-required">*</span>
              </Label>
              <Select value={formData.channel} onValueChange={(value) => handleChange("channel", value)}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  {channels.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress" className="form-label">
                IP Address
              </Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => handleChange("ipAddress", e.target.value)}
                placeholder="e.g., 192.168.1.1"
                className="form-input"
              />
            </div>
          </div>

          {/* Row 5: Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="form-label">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g., Mumbai, India"
              className="form-input"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || accountStatus?.status === 'BLOCKED'}
              className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Transaction
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              className="flex-1 sm:flex-none"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
