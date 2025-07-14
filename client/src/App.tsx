import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useOffline } from "@/hooks/use-offline";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Pages
import Home from "@/pages/home";
import Tracking from "@/pages/tracking";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import AuthorityDashboard from "@/pages/authority-dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";

// Layout Components
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AuthWrapper from "@/components/auth/auth-wrapper";

function Router() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF6B35]" />
          <p className="text-gray-600">Loading RakshaSahayak...</p>
        </div>
      </div>
    );
  }

  // Show login/signup pages when not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={Login} /> {/* Default to login for all other routes */}
      </Switch>
    );
  }

  // Show main app when authenticated
  return (
    <div className="min-h-screen bg-light">
      <Header />
      <main className="pb-20 md:pb-0">
        <Switch>
          <Route path="/login" component={() => <div>Redirecting...</div>} />
          <Route path="/signup" component={() => <div>Redirecting...</div>} />
          <Route path="/" component={Home} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/reports" component={Reports} />
          <Route path="/profile" component={Profile} />
          <Route path="/authority" component={AuthorityDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNavigation />
    </div>
  );
}

function App() {
  const { isOnline } = useOffline();

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Offline Banner */}
        <div className={`offline-banner ${!isOnline ? 'visible' : ''}`}>
          <div className="flex items-center justify-center space-x-2">
            <i className="fas fa-wifi"></i>
            <span className="text-sm font-medium">
              You are currently offline. Some features may be limited.
            </span>
          </div>
        </div>
        
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
