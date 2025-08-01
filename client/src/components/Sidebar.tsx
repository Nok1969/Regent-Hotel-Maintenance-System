import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { NotificationBell } from "@/components/NotificationBell";
import {
  Home,
  Plus,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  Wrench,
  Users,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      href: "/",
      icon: Home,
      label: t("navigation.dashboard") || "Dashboard",
      badge: null,
      requiresPermission: null,
    },
    {
      href: "/new-repair",
      icon: Plus,
      label: t("navigation.newRepair"),
      badge: null,
      requiresPermission: "canCreateRepairs",
    },
    {
      href: "/repairs",
      icon: ClipboardList,
      label: t("navigation.repairHistory"),
      badge: null,
      requiresPermission: "canViewAllRepairs",
    },
    {
      href: "/notifications",
      icon: Bell,
      label: t("navigation.notifications"),
      badge: 3,
      requiresPermission: null,
    },
    {
      href: "/users",
      icon: Users,
      label: t("navigation.users"),
      badge: null,
      requiresPermission: "canViewAllUsers",
    },

  ];

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (!item.requiresPermission) return true;
    return user?.permissions?.[item.requiresPermission];
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border transform transition-transform duration-200 z-30 shadow-modern gradient-card sidebar-enhanced",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        className
      )}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
    >
      <nav className="p-4 space-y-2 custom-scrollbar">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-foreground font-semibold",
                  isActive && "bg-primary text-primary-foreground font-bold",
                  !isActive && "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                )}
                onClick={onClose}
                style={!isActive ? { color: '#212121', fontWeight: '600' } : {}}
              >
                <Icon className="h-4 w-4 mr-3" style={!isActive ? { color: '#212121' } : {}} />
                <span className="flex-1 text-left font-semibold" style={!isActive ? { color: '#212121' } : {}}>{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}

        <Separator className="my-4" />

        <Button variant="ghost" className="w-full justify-start font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-100" style={{ color: '#212121', fontWeight: '600' }}>
          <Settings className="h-4 w-4 mr-3" style={{ color: '#212121' }} />
          <span style={{ color: '#212121' }}>{t("navigation.settings")}</span>
        </Button>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
          style={{ color: '#dc2626', fontWeight: '600' }}
        >
          <LogOut className="h-4 w-4 mr-3" style={{ color: '#dc2626' }} />
          <span style={{ color: '#dc2626' }}>{t("auth.signOut")}</span>
        </Button>
      </nav>

      {user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#212121', fontWeight: '600' }}>
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs capitalize" style={{ color: '#666666', fontWeight: '500' }}>
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
