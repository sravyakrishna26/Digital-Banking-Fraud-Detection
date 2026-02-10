import { useEffect, useMemo, useState } from "react";
import { getBlockedAccounts, type AccountStatus, type ApiResponse } from "@/services/transactionApi";
import AppNavbar from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Ban,
  Loader2,
  Search,
  UserSearch,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Blocked account type used by this page.
 * Extends the core AccountStatus shape with optional metadata
 * that the backend may include for better UX.
 */
interface BlockedAccount extends AccountStatus {
  accountId?: string;
  accountHolderName?: string;
  blockReason?: string;
}

const PAGE_SIZE = 10;

const BlockedAccounts = () => {
  const [accounts, setAccounts] = useState<BlockedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedAccount, setSelectedAccount] = useState<BlockedAccount | null>(null);
  const [unblockTarget, setUnblockTarget] = useState<BlockedAccount | null>(null);
  const [unblocking, setUnblocking] = useState(false);

  const fetchBlockedAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<{ count: number; accounts: BlockedAccount[] }> = await getBlockedAccounts();

      if (response.success && response.data) {
        setAccounts(response.data.accounts || []);
        setCurrentPage(1);
      } else {
        setAccounts([]);
        setError(response.error || "Failed to fetch blocked accounts");
      }
    } catch (err) {
      setAccounts([]);
      setError("An unexpected error occurred while fetching blocked accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts;
    const term = searchTerm.toLowerCase();

    return accounts.filter((account) => {
      return (
        account.accountNumber.toLowerCase().includes(term) ||
        account.accountId?.toString().toLowerCase().includes(term) ||
        account.accountHolderName?.toLowerCase().includes(term) ||
        account.status?.toLowerCase().includes(term) ||
        account.blockReason?.toLowerCase().includes(term)
      );
    });
  }, [accounts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const clampedPage = Math.min(currentPage, totalPages);
  const pageStart = (clampedPage - 1) * PAGE_SIZE;
  const paginatedAccounts = filteredAccounts.slice(pageStart, pageStart + PAGE_SIZE);

  const handleUnblock = async (account: BlockedAccount) => {
    // NOTE: Backend endpoint assumption
    // We assume POST /api/accounts/{accountNumber}/unblock will unblock the account.
    setUnblocking(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/accounts/${encodeURIComponent(
          account.accountNumber,
        )}/unblock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Optimistically refresh the list after successful unblock
      await fetchBlockedAccounts();
      setUnblockTarget(null);
    } catch (err) {
      console.error("Failed to unblock account", err);
      // Keep a user-friendly message; detailed errors go to console
      setError("Failed to unblock account. Please try again.");
    } finally {
      setUnblocking(false);
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A";
    try {
      const date = new Date(value);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="card-elevated p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
          <p className="text-muted-foreground font-medium">Loading blocked accounts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card-elevated p-4 bg-destructive/10 border-destructive/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      );
    }

    if (!accounts.length) {
      return (
        <div className="card-elevated p-12 flex flex-col items-center justify-center text-center">
          <UserSearch className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No Blocked Accounts Found</p>
        </div>
      );
    }

    return (
      <section className="card-elevated overflow-hidden">
        {/* Table header with search */}
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Blocked Accounts</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filteredAccounts.length} blocked account{filteredAccounts.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by ID, Name, or Account Number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-3 form-input"
            />
          </div>
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Account Holder</th>
                <th>Account Number</th>
                <th>Status</th>
                <th>Block Reason</th>
                <th>Blocked At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((account, idx) => (
                <tr key={account.accountNumber || idx}>
                  <td className="mono-text text-xs">{account.accountId || "—"}</td>
                  <td className="text-sm font-medium">{account.accountHolderName || "Unknown"}</td>
                  <td className="mono-text text-xs">{account.accountNumber}</td>
                  <td>
                    <span className={cn("status-badge", "status-danger")}>BLOCKED</span>
                  </td>
                  <td className="max-w-[220px]">
                    {account.blockReason ? (
                      <span className="text-xs text-warning bg-warning-muted px-2 py-1 rounded">
                        {account.blockReason}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">Not specified</span>
                    )}
                  </td>
                  <td>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDateTime(account.blockedAt)}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAccount(account)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUnblockTarget(account)}
                      >
                        Unblock
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/40">
          <p className="text-xs text-muted-foreground">
            Page {clampedPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={clampedPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={clampedPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar active="blocked-accounts" onRefresh={fetchBlockedAccounts} refreshing={loading} />

      <main className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick summary */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="stat-icon bg-danger-muted text-danger">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Blocked</p>
              <p className="text-2xl font-semibold">{accounts.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-warning-muted text-warning">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Currently Visible</p>
              <p className="text-2xl font-semibold">{paginatedAccounts.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-secondary text-secondary-foreground">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Search Term</p>
              <p className="text-sm font-medium truncate">{searchTerm || "None"}</p>
            </div>
          </div>
        </section>

        {/* Table / messages */}
        {renderContent()}
      </main>

      {/* View Details Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected blocked account.
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Account ID</span>
                <span className="mono-text">{selectedAccount.accountId || "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Account Holder</span>
                <span className="font-medium">{selectedAccount.accountHolderName || "Unknown"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Account Number</span>
                <span className="mono-text">{selectedAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="text-destructive font-semibold">BLOCKED</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Blocked At</span>
                <span>{formatDateTime(selectedAccount.blockedAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Unblock At</span>
                <span>{formatDateTime(selectedAccount.unblockAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Failed Count (last 5 min)</span>
                <span>{selectedAccount.failedCountLast5Min ?? 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Block Reason</span>
                <span className="text-sm">
                  {selectedAccount.blockReason || "Not specified. Most likely due to repeated failed transactions."}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedAccount(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Confirmation Dialog */}
      <Dialog open={!!unblockTarget} onOpenChange={(open) => !open && !unblocking && setUnblockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to unblock this account? The account will be allowed to process new transactions.
            </DialogDescription>
          </DialogHeader>
          {unblockTarget && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Account Number: </span>
                <span className="mono-text">{unblockTarget.accountNumber}</span>
              </p>
              {unblockTarget.accountHolderName && (
                <p>
                  <span className="text-muted-foreground">Account Holder: </span>
                  <span className="font-medium">{unblockTarget.accountHolderName}</span>
                </p>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setUnblockTarget(null)}
              disabled={unblocking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => unblockTarget && handleUnblock(unblockTarget)}
              disabled={unblocking}
            >
              {unblocking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Unblock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlockedAccounts;

