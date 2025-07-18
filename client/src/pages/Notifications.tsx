import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, CheckCircle, Clock, Bell, AlertCircle } from "lucide-react";

export default function Notifications() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

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

  // Fetch notifications from backend
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter === "unread") {
        params.append("isRead", "false");
      }
      const response = await apiRequest("GET", `/api/notifications?${params}`);
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: t("messages.success"),
        description: "Notification marked as read",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("messages.error"),
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", "/api/notifications/read-all");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: t("messages.success"),
        description: "All notifications marked as read",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("messages.error"),
        description: error.message || "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_request":
        return Plus;
      case "completed":
        return CheckCircle;
      case "status_update":
        return Clock;
      case "assigned":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_request":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "status_update":
        return "bg-yellow-500";
      case "assigned":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading || notificationsLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              {t("notifications.title")}
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Stay updated with repair requests and system updates
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="flex-1 sm:flex-none"
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className="flex-1 sm:flex-none"
              >
                Unread ({unreadCount})
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadCount === 0}
              className="flex-1 sm:flex-none"
            >
              {t("notifications.markAllRead")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification: any) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              const createdAt = new Date(notification.createdAt);
              const timeAgo = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                Math.floor((createdAt.getTime() - Date.now()) / (1000 * 60 * 60)),
                'hour'
              );

              return (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                    !notification.isRead
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                      : "bg-background hover:bg-muted/30"
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-foreground line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
