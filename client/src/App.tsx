import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useOffline } from "@/hooks/use-offline";
import { useEffect } from "react";

// Pages
import Home from "@/pages/home";
import Tracking from "@/pages/tracking";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import AuthorityDashboard from "@/pages/authority-dashboard";
import NotFound from "@/pages/not-found";

// Layout Components
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";

function Router() {
  return (
    <div className="min-h-screen bg-light">
      <Header />
      <main className="pb-20 md:pb-0">
        <Switch>
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
