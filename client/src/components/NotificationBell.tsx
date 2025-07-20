import { useState } from "react";
import { Bell, Check, Clock, Settings, Wrench } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { th } from "date-fns/locale";

interface Notification {
  id: number;
  userId: string;
  title: string;
  description: string;
  type: "new_request" | "status_update" | "completed" | "assigned";
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
  updatedAt: string;
}

export function NotificationBell() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications with auto-refresh
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 30000, // Auto-refresh every 30 seconds for real-time
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถทำเครื่องหมายว่าอ่านได้",
        variant: "destructive",
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/notifications/mark-as-read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "สำเร็จ",
        description: "ทำเครื่องหมายอ่านทั้งหมดแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถทำเครื่องหมายอ่านทั้งหมดได้",
        variant: "destructive",
      });
    },
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_request":
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "assigned":
        return <Settings className="w-4 h-4 text-orange-500" />;
      case "status_update":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      const timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: th });
      const exactTime = format(date, "d MMM HH:mm", { locale: th });
      return { timeAgo, exactTime };
    } catch (error) {
      return { timeAgo: "เมื่อไหร่ไม่ทราบ", exactTime: "เวลาไม่ทราบ" };
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-auto text-primary-foreground hover:bg-white/10"
          aria-label={`การแจ้งเตือน ${unreadCount > 0 ? `(${unreadCount} ข้อความใหม่)` : ""}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-[20px] animate-pulse"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>การแจ้งเตือน</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              อ่านทั้งหมด
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            กำลังโหลด...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            ไม่มีการแจ้งเตือน
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            {notifications.slice(0, 20).map((notification: Notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer focus:bg-muted ${
                  !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatNotificationTime(notification.createdAt).timeAgo}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {formatNotificationTime(notification.createdAt).exactTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-muted-foreground cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                window.location.href = "/notifications";
              }}
            >
              ดูการแจ้งเตือนทั้งหมด
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}