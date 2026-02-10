import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getAdminProfile, type AdminProfile as ApiAdminProfile } from "@/services/authApi";
import {
  BarChart3,
  Clock3,
  FileText,
  History,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Shield,
  User2,
  Ban,
} from "lucide-react";

type ActivePage = "new-transaction" | "history" | "dashboard" | "blocked-accounts";

interface AppNavbarProps {
  /** Which primary nav item is currently active (for highlighting). */
  active: ActivePage;
  /** Optional callback for a page-specific refresh action. If not provided, the navbar will hard-reload the route. */
  onRefresh?: () => void;
  /** Optional flag to disable the refresh button while a page-level refresh is in progress. */
  refreshing?: boolean;
}

interface AdminProfile {
  name: string;
  email: string;
  lastLogin: string;
}

/**
 * Common application navbar shown on all authenticated pages.
 * Contains primary navigation, refresh, logout, and an admin profile dropdown.
 */
const AppNavbar = ({ active, onRefresh, refreshing }: AppNavbarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      // Try to fetch admin profile from backend (UserRepository via /api/auth/me)
      const result = await getAdminProfile();

      if (!isMounted) return;

      if (result.success && result.data) {
        const data: ApiAdminProfile = result.data;
        setAdminProfile({
          name: data.username,
          email: data.email,
          lastLogin: new Date(data.lastLoginTime).toLocaleString("en-IN"),
        });
      } else {
        // Fallback to generic display if API fails or user is not authenticated
        const lastLogin =
          window.localStorage.getItem("adminLastLogin") || new Date().toLocaleString("en-IN");
        setAdminProfile({
          name: "Admin User",
          email: "admin@system.local",
          lastLogin,
        });
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    // Slight delay for nicer UX / allowing toasts if needed
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 150);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Fallback: reload the current route which will naturally re-run data fetching hooks.
      navigate(0);
    }
  };

  const isActive = (page: ActivePage) => active === page;

  const initials =
    adminProfile?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-20 bg-black text-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section: brand + primary nav */}
          <div className="flex items-center gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-white/10 rounded-full">
                <Shield className="w-6 h-6" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-wide uppercase text-white/80">
                  Fraud Detection Suite
                </span>
                <span className="text-xs text-white/50">
                  Admin Console
                </span>
              </div>
            </div>

            {/* Primary navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link to="/">
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "border-0 px-3 py-2 h-9 flex items-center gap-2",
                    isActive("new-transaction")
                      ? "bg-white text-black"
                      : "bg-white/10 hover:bg-white/20 text-white",
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">New Transaction</span>
                </Button>
              </Link>
              <Link to="/history">
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "border-0 px-3 py-2 h-9 flex items-center gap-2",
                    isActive("history")
                      ? "bg-white text-black"
                      : "bg-white/10 hover:bg-white/20 text-white",
                  )}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Transaction History</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "border-0 px-3 py-2 h-9 flex items-center gap-2",
                    isActive("dashboard")
                      ? "bg-white text-black"
                      : "bg-white/10 hover:bg-white/20 text-white",
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Dashboard</span>
                </Button>
              </Link>
              <Link to="/blocked-accounts">
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "border-0 px-3 py-2 h-9 flex items-center gap-2",
                    isActive("blocked-accounts")
                      ? "bg-white text-black"
                      : "bg-white/10 hover:bg-white/20 text-white",
                  )}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Blocked Accounts</span>
                </Button>
              </Link>
            </nav>
          </div>

          {/* Right section: refresh, logout, profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white border-0 h-9 px-3 flex items-center gap-2"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  (refreshing || location.state === "refreshing") && "animate-spin",
                )}
              />
              <span className="hidden sm:inline text-xs font-medium">Refresh</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-white/10 hover:bg-white/20 text-white border-0 h-9 px-3 flex items-center gap-2"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden sm:inline text-xs font-medium">Log Out</span>
            </Button>

            {/* Admin profile dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 p-0.5 hover:bg-white/15 transition-colors"
                  aria-label="Admin profile"
                >
                  <Avatar className="h-9 w-9 border border-white/30">
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-64 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <User2 className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{adminProfile?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{adminProfile?.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <Clock3 className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Last login</p>
                      <p className="text-[11px] text-foreground">{adminProfile?.lastLogin}</p>
                    </div>
                  </div>
                  <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Signed in as administrator</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mobile nav row */}
        <div className="mt-3 flex md:hidden gap-2 overflow-x-auto pb-1">
          <Link to="/">
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "border-0 px-3 py-2 h-9 flex items-center gap-1.5 text-xs",
                isActive("new-transaction")
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20 text-white",
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </Link>
          <Link to="/history">
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "border-0 px-3 py-2 h-9 flex items-center gap-1.5 text-xs",
                isActive("history")
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20 text-white",
              )}
            >
              <History className="w-3.5 h-3.5" />
              History
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "border-0 px-3 py-2 h-9 flex items-center gap-1.5 text-xs",
                isActive("dashboard")
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20 text-white",
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Dashboard
            </Button>
          </Link>
          <Link to="/blocked-accounts">
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "border-0 px-3 py-2 h-9 flex items-center gap-1.5 text-xs",
                isActive("blocked-accounts")
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20 text-white",
              )}
            >
              <Ban className="w-3.5 h-3.5" />
              Blocked
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;

