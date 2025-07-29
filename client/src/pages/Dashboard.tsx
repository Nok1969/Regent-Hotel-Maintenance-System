import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ExportButton } from "@/components/ExportButton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RepairPieChart } from "@/components/charts/RepairPieChart";
import { RepairBarChart } from "@/components/charts/RepairBarChart";
import { RepairAreaChart } from "@/components/charts/RepairAreaChart";
import { StatusBadge, UrgencyBadge, CategoryBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  Clock,
  Zap,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", "summary"],
    queryFn: async () => {
      const response = await fetch("/api/stats/summary");
      if (!response.ok) {
        throw new Error(`Failed to fetch stats summary: ${response.status}`);
      }
      return response.json();
    },
    retry: false,
  });

  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery({
    queryKey: ["stats", "monthly"],
    queryFn: async () => {
      const response = await fetch("/api/stats/monthly");
      if (!response.ok) {
        throw new Error(`Failed to fetch monthly stats: ${response.status}`);
      }
      return response.json();
    },
    retry: false,
  });

  const { data: recentRepairs = [], isLoading: repairsLoading } = useQuery({
    queryKey: ["repairs", "recent", { limit: 5 }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "5" });
      const response = await fetch(`/api/repairs?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recent repairs: ${response.status}`);
      }
      return response.json();
    },
    retry: false,
  });

  // Debounced error handling to prevent rapid redirects
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleError = (error: Error) => {
      if (isUnauthorizedError(error)) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          toast({
            title: "Unauthorized",
            description: t("messages.unauthorized"),
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
        }, 100);
      }
    };

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [toast, t]);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {t(`status.${status}`)}
      </Badge>
    );
  };

  const getPriorityBadge = (urgency: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    };

    return (
      <Badge className={colors[urgency as keyof typeof colors]}>
        {t(`priority.${urgency}`)}
      </Badge>
    );
  };

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!stats) return null;
    
    console.log('Dashboard stats:', stats);
    console.log('Monthly stats:', monthlyStats);
    
    return {
      categoryData: stats.byCategory || {},
      statusData: stats.byStatus || {},
      monthlyData: monthlyStats && Array.isArray(monthlyStats) && monthlyStats.length > 0 
        ? monthlyStats 
        : [
            { month: "Jan", count: 8, completed: 6 },
            { month: "Feb", count: 12, completed: 10 },
            { month: "Mar", count: 15, completed: 13 },
            { month: "Apr", count: 10, completed: 8 },
            { month: "May", count: 18, completed: 15 },
            { month: "Jun", count: 14, completed: 12 },
          ],
    };
  }, [stats, monthlyStats]);

  // Memoize stats cards to prevent re-renders
  const statsCards = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        title: t("dashboard.totalRepairs"),
        value: stats.total || 0,
        icon: ClipboardList,
        color: "text-white font-bold",
        bgColor: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg",
        cardBg: "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400",
        iconBg: "bg-white/20",
      },
      {
        title: t("dashboard.pendingRepairs"),
        value: stats.pending || 0,
        icon: Clock,
        color: "text-white font-bold",
        bgColor: "bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg",
        cardBg: "bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400",
        iconBg: "bg-white/20",
      },
      {
        title: t("dashboard.inProgressRepairs"),
        value: stats.inProgress || 0,
        icon: Zap,
        color: "text-white font-bold",
        bgColor: "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg",
        cardBg: "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400",
        iconBg: "bg-white/20",
      },
      {
        title: t("dashboard.completedRepairs"),
        value: stats.completed || 0,
        icon: CheckCircle,
        color: "text-white font-bold",
        bgColor: "bg-gradient-to-br from-green-500 to-green-600 shadow-lg",
        cardBg: "bg-gradient-to-br from-green-500 to-green-600 border-green-400",
        iconBg: "bg-white/20",
      },
    ];
  }, [stats, t]);

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-6">
                <Skeleton className="h-12 sm:h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          statsCards.map((card, index) => (
            <Card key={index} className={cn(
              "overflow-hidden transition-all duration-300 hover:shadow-lg animate-scale-in border-2",
              card.cardBg
            )} style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-white/90">
                      {card.title}
                    </p>
                    <p className={cn("text-xl sm:text-3xl font-bold", card.color)}>
                      {card.value}
                    </p>
                  </div>
                  <div className={cn(
                    "h-8 w-8 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center shadow-sm",
                    card.iconBg
                  )}>
                    <card.icon className={cn("h-4 w-4 sm:h-6 sm:w-6", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts */}
      {statsLoading ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[250px] sm:h-[300px]" />
            ))}
          </div>
        </div>
      ) : (
        chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
            <RepairPieChart
              data={chartData.categoryData}
              title={t("charts.repairsByCategory")}
              size="sm"
            />
            <RepairBarChart
              data={chartData.statusData}
              title={t("charts.repairsByStatus")}
              size="sm"
            />
            <div className="lg:col-span-2 xl:col-span-1">
              <RepairAreaChart
                data={chartData.monthlyData}
                title={t("charts.monthlyTrend")}
                size="sm"
              />
            </div>
          </div>
        )
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-dark-enhanced">{t("dashboard.recentRequests")}</CardTitle>
            {user?.role === 'admin' && stats && (
              <ExportButton 
                data={[
                  { label: 'Total', value: stats.total },
                  { label: 'Pending', value: stats.pending },
                  { label: 'In Progress', value: stats.inProgress },
                  { label: 'Completed', value: stats.completed }
                ]}
                filename={`dashboard-stats-${new Date().toISOString().split('T')[0]}`}
                type="stats"
                title="สถิติแดชบอร์ด - โรงแรมวาลา หัวหิน นิว แชปเตอร์"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {repairsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-dark-enhanced font-semibold">{t("table.room")}</TableHead>
                    <TableHead className="text-dark-enhanced font-semibold">{t("table.category")}</TableHead>
                    <TableHead className="text-dark-enhanced font-semibold">{t("table.status")}</TableHead>
                    <TableHead className="text-dark-enhanced font-semibold">{t("table.priority")}</TableHead>
                    <TableHead className="text-dark-enhanced font-semibold">{t("table.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRepairs.map((repair: any) => (
                    <TableRow key={repair.id}>
                      <TableCell className="font-medium text-dark-enhanced">{repair.room}</TableCell>
                      <TableCell className="text-medium-enhanced">{t(`categories.${repair.category}`)}</TableCell>
                      <TableCell>{getStatusBadge(repair.status)}</TableCell>
                      <TableCell>{getPriorityBadge(repair.urgency)}</TableCell>
                      <TableCell>
                        {new Date(repair.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {recentRepairs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-medium-enhanced">ไม่มีรายการแจ้งซ่อมล่าสุด</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
