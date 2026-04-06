import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { setupApiAuth } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import BrowsePage from "@/pages/browse";
import BookmarksPage from "@/pages/bookmarks";
import AdminDashboard from "@/pages/admin/index";
import AdminUpload from "@/pages/admin/upload";
import AdminManage from "@/pages/admin/manage";
import AdminAnnouncements from "@/pages/admin/announcements";
import AdminAnalytics from "@/pages/admin/analytics";

setupApiAuth();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (adminOnly && !isAdmin) {
      setLocation("/dashboard");
    } else if (!adminOnly && isAdmin) {
      setLocation("/admin");
    }
  }, [isAuthenticated, isAdmin, adminOnly, setLocation]);

  if (!isAuthenticated) return null;
  if (adminOnly && !isAdmin) return null;
  if (!adminOnly && isAdmin) return null;

  return (
    <PageWrapper>
      <Component />
    </PageWrapper>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation(isAdmin ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  if (isAuthenticated) return null;

  return (
    <PageWrapper>
      <Component />
    </PageWrapper>
  );
}

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/" component={() => <PublicRoute component={AuthPage} />} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
        <Route path="/browse" component={() => <ProtectedRoute component={BrowsePage} />} />
        <Route path="/bookmarks" component={() => <ProtectedRoute component={BookmarksPage} />} />
        <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
        <Route path="/admin/upload" component={() => <ProtectedRoute component={AdminUpload} adminOnly />} />
        <Route path="/admin/manage" component={() => <ProtectedRoute component={AdminManage} adminOnly />} />
        <Route path="/admin/announcements" component={() => <ProtectedRoute component={AdminAnnouncements} adminOnly />} />
        <Route path="/admin/analytics" component={() => <ProtectedRoute component={AdminAnalytics} adminOnly />} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
