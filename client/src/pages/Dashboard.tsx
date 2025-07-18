import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

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

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();

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
    
    return {
      categoryData: stats.byCategory || {},
      statusData: stats.byStatus || {},
      monthlyData: monthlyStats || [
        { month: "Jan", count: 8, completed: 6 },
        { month: "Feb", count: 12, completed: 10 },
        { month: "Mar", count: 15, completed: 13 },
        { month: "Apr", count: 10, completed: 8 },
        { month: "May", count: 18, completed: 15 },
        { month: "Jun", count: 14, completed: 12 },
      ],
    };
  }, [stats]);

  // Memoize stats cards to prevent re-renders
  const statsCards = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        title: t("dashboard.totalRepairs"),
        value: stats.total || 0,
        icon: ClipboardList,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        title: t("dashboard.pendingRepairs"),
        value: stats.pending || 0,
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      {
        title: t("dashboard.inProgressRepairs"),
        value: stats.inProgress || 0,
        icon: Zap,
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
      {
        title: t("dashboard.completedRepairs"),
        value: stats.completed || 0,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
    ];
  }, [stats, t]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          statsCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts */}
      {statsLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      ) : (
        chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <RepairPieChart
              data={chartData.categoryData}
              title={t("charts.repairsByCategory")}
              size="md"
            />
            <RepairBarChart
              data={chartData.statusData}
              title={t("charts.repairsByStatus")}
              size="md"
              color="#10B981"
            />
            <div className="lg:col-span-2 xl:col-span-1">
              <RepairAreaChart
                data={chartData.monthlyData}
                title={t("charts.monthlyTrend")}
                size="md"
                color="#3B82F6"
              />
            </div>
          </div>
        )
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentRequests")}</CardTitle>
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
                    <TableHead>{t("table.room")}</TableHead>
                    <TableHead>{t("table.category")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.priority")}</TableHead>
                    <TableHead>{t("table.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRepairs.map((repair: any) => (
                    <TableRow key={repair.id}>
                      <TableCell className="font-medium">{repair.room}</TableCell>
                      <TableCell>{t(`categories.${repair.category}`)}</TableCell>
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
                  <p className="text-muted-foreground">No recent requests found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
