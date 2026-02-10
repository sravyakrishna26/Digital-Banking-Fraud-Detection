import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTransaction, Transaction } from "@/services/transactionApi";

interface AutoTransactionGeneratorProps {
  onTransactionsGenerated?: () => void;
}

const currencies = ["INR", "USD", "EUR", "GBP"];
const transactionTypes = ["TRANSFER", "WITHDRAW", "DEPOSIT", "PAYMENT"];
const channels = ["MOBILE", "ATM", "CARD", "NETBANKING"];

// Common account prefixes for realistic account numbers
const accountPrefixes = ["AC", "ACC", "ACC", "BANK"];
const locations = [
  "Mumbai, India",
  "Delhi, India",
  "Bangalore, India",
  "New York, USA",
  "London, UK",
  "Tokyo, Japan",
  "Singapore",
  "Dubai, UAE",
  "Sydney, Australia",
  "Toronto, Canada",
];

const ipRanges = [
  "192.168.1.",
  "10.0.0.",
  "172.16.0.",
  "203.0.113.",
  "198.51.100.",
];

/**
 * Generates a random fake transaction with realistic but randomized values
 * Some transactions are intentionally suspicious (high amount, unusual time, repeated accounts)
 */
const generateFakeTransaction = (index: number, total: number): Omit<Transaction, 'status' | 'fraudFlag' | 'fraudReason' | 'timestampVal'> => {
  // Generate unique transaction ID
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const transactionId = `TXN${timestamp}${randomSuffix}${index}`;

  // Determine if this should be a suspicious transaction (20% chance)
  const isSuspicious = Math.random() < 0.2;

  // Generate amount - suspicious transactions have higher amounts
  let amount: number;
  if (isSuspicious) {
    // High amounts for suspicious transactions: 50000 to 1000000
    amount = Math.random() * 950000 + 50000;
  } else {
    // Normal amounts: 100 to 50000
    amount = Math.random() * 49900 + 100;
  }
  amount = Math.round(amount * 100) / 100; // Round to 2 decimal places

  // Generate timestamp - suspicious transactions might have unusual times
  const now = new Date();
  let transactionDate: Date;

  if (isSuspicious && Math.random() < 0.5) {
    // Unusual time: late night (2 AM - 5 AM) or very early morning
    const hours = Math.floor(Math.random() * 3) + 2; // 2-5 AM
    transactionDate = new Date(now);
    transactionDate.setHours(hours, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
    // Sometimes make it a few days ago to simulate repeated patterns
    if (Math.random() < 0.3) {
      transactionDate.setDate(transactionDate.getDate() - Math.floor(Math.random() * 7));
    }
  } else {
    // Normal time: within last 24 hours with some variation
    const hoursAgo = Math.random() * 24;
    transactionDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  }

  const timestampStr = transactionDate.toISOString().slice(0, 19).replace('T', ' ');

  // Generate accounts - use unique accounts to avoid blocking during testing
  // Note: Account reuse is disabled to prevent account blocking from interfering with test data generation
  let senderAccount: string;
  let receiverAccount: string;

  // Always generate unique sender accounts to prevent blocking during batch generation
  // This ensures test transactions don't get blocked due to multiple failures
  const prefix = accountPrefixes[Math.floor(Math.random() * accountPrefixes.length)];
  // Use timestamp + index + random to ensure uniqueness across batch generation
  const uniqueId = timestamp + index * 1000 + Math.floor(Math.random() * 1000);
  const accountNum = (uniqueId % 90000000) + 10000000; // Ensure 8-digit number
  senderAccount = `${prefix}${String(accountNum)}`;

  // Generate receiver account, ensuring it's different from sender
  let attempts = 0;
  do {
    const receiverPrefix = accountPrefixes[Math.floor(Math.random() * accountPrefixes.length)];
    const receiverNum = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
    receiverAccount = `${receiverPrefix}${String(receiverNum)}`;
    attempts++;
  } while (receiverAccount === senderAccount && attempts < 10);

  // Fallback: if still same, append different suffix
  if (receiverAccount === senderAccount) {
    const receiverPrefix = accountPrefixes[Math.floor(Math.random() * accountPrefixes.length)];
    receiverAccount = `${receiverPrefix}${String(Math.floor(Math.random() * 90000000) + 20000000)}`;
  }

  // Random currency
  const currency = currencies[Math.floor(Math.random() * currencies.length)];

  // Random transaction type
  const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

  // Random channel
  const channel = channels[Math.floor(Math.random() * channels.length)];

  // Random location (optional)
  const location = Math.random() < 0.7 ? locations[Math.floor(Math.random() * locations.length)] : undefined;

  // Random IP address (optional)
  const ipAddress = Math.random() < 0.6
    ? `${ipRanges[Math.floor(Math.random() * ipRanges.length)]}${Math.floor(Math.random() * 255)}`
    : undefined;

  return {
    transactionId,
    timestamp: timestampStr,
    amount,
    currency,
    senderAccount,
    receiverAccount,
    transactionType,
    channel,
    ipAddress,
    location,
  };
};

const AutoTransactionGenerator = ({ onTransactionsGenerated }: AutoTransactionGeneratorProps) => {
  const [numberOfTransactions, setNumberOfTransactions] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: "", text: "" });

  const handleGenerate = async () => {
    if (numberOfTransactions < 1 || numberOfTransactions > 100) {
      setMessage({
        type: "error",
        text: "Please enter a number between 1 and 100",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    let successCount = 0;
    let failureCount = 0;

    try {
      // Generate and send transactions sequentially
      for (let i = 0; i < numberOfTransactions; i++) {
        const transaction = generateFakeTransaction(i, numberOfTransactions);

        try {
          const result = await createTransaction(transaction);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }

          // Small delay between requests to avoid overwhelming the backend
          if (i < numberOfTransactions - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          failureCount++;
        }
      }

      // Show success message
      if (successCount > 0) {
        setMessage({
          type: "success",
          text: `Successfully generated ${successCount} transaction${successCount !== 1 ? 's' : ''}${failureCount > 0 ? ` (${failureCount} failed)` : ''}!`,
        });

        if (onTransactionsGenerated) {
          onTransactionsGenerated();
        }
      } else {
        setMessage({
          type: "error",
          text: `Failed to generate transactions. ${failureCount} transaction${failureCount !== 1 ? 's' : ''} failed.`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred while generating transactions.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="card-elevated p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Auto Generate Fake Transactions (Testing & Demo)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically generate multiple synthetic transactions with randomized but realistic values.
            Some transactions are intentionally designed to trigger fraud detection rules.
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

        <div className="space-y-6">
          {/* Number of Transactions Input */}
          <div className="space-y-2">
            <Label htmlFor="numberOfTransactions" className="form-label">
              Number of Transactions
            </Label>
            <Input
              id="numberOfTransactions"
              type="number"
              value={numberOfTransactions}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) {
                  setNumberOfTransactions(Math.min(value, 100));
                } else if (e.target.value === "") {
                  setNumberOfTransactions(10);
                }
              }}
              placeholder="10"
              min="1"
              max="100"
              className="form-input"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter a number between 1 and 100 (default: 10)
            </p>
          </div>

          {/* Generate Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Fake Transactions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTransactionGenerator;

