import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Plus, CheckCircle, Clock, Bell } from "lucide-react";

export default function Notifications() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: t("messages.unauthorized"),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, t]);

  // Mock notifications for demonstration
  const notifications = [
    {
      id: 1,
      type: "new_request",
      title: t("notifications.newRequest"),
      description: "Room 101 - Electrical issue reported",
      time: "2 minutes ago",
      unread: true,
      icon: Plus,
      color: "bg-primary",
    },
    {
      id: 2,
      type: "completed",
      title: t("notifications.repairCompleted"),
      description: "Room 312 air conditioning repair has been completed",
      time: "1 hour ago",
      unread: true,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      id: 3,
      type: "status_update",
      title: t("notifications.statusUpdated"),
      description: "Room 205 plumbing repair is now in progress",
      time: "3 hours ago",
      unread: false,
      icon: Clock,
      color: "bg-yellow-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>{t("messages.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("notifications.title")}</CardTitle>
          <Button variant="outline" size="sm">
            {t("notifications.markAllRead")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 ${notification.color} rounded-full flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.time}
                  </p>
                </div>
                {notification.unread && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
