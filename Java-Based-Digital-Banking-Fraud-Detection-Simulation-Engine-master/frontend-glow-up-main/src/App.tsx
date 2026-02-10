import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import TransactionHistory from "./pages/TransactionHistory";
import Dashboard from "./pages/Dashboard";
import BlockedAccounts from "./pages/BlockedAccounts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle authenticated routes redirect
const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated } = useAuth();
  return authenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public auth routes */}
    <Route
      path="/login"
      element={
        <AuthenticatedRoute>
          <Login />
        </AuthenticatedRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <AuthenticatedRoute>
          <Signup />
        </AuthenticatedRoute>
      }
    />

    {/* Protected routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      }
    />
    <Route
      path="/history"
      element={
        <ProtectedRoute>
          <TransactionHistory />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/blocked-accounts"
      element={
        <ProtectedRoute>
          <BlockedAccounts />
        </ProtectedRoute>
      }
    />

    {/* Default route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
