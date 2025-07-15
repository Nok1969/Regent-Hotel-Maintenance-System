import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import maintenanceIcon from "@assets/Icon_maintenance2.png!sw800_1752589313813.png";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewRepair from "@/pages/NewRepair";
import Repairs from "@/pages/Repairs";
import Notifications from "@/pages/Notifications";
import Users from "@/pages/Users";
import NotFound from "@/pages/not-found";

import "./i18n";

function AppHeader({ user, onMenuClick }: { user: any; onMenuClick: () => void }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center space-x-3">
          <img 
            src={maintenanceIcon} 
            alt="Maintenance System" 
            className="w-8 h-8 rounded-full"
          />
          <h1 className="text-xl font-semibold">{t("app.title")}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell count={3} />

        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.firstName} ({user.role})
            </span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-primary-foreground font-medium">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Check if this is a mock user by looking at email domain
                if (user.email?.includes('@hotel.com')) {
                  // Mock logout
                  fetch('/api/auth/mock-logout', { method: 'POST' })
                    .then(() => window.location.reload());
                } else {
                  // Replit logout
                  window.location.href = "/api/logout";
                }
              }}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeSidebar = () => setSidebarOpen(false);

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <>
      <AppHeader user={user} onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />
        
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20"
            onClick={closeSidebar}
          />
        )}

        <main className="flex-1 lg:ml-64 p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/new-repair" component={NewRepair} />
            <Route path="/repairs" component={Repairs} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/users" component={Users} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
