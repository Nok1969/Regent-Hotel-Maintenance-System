import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCharts } from "@/components/DashboardCharts";
import { Badge } from "@/components/ui/badge";
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
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: recentRepairs = [], isLoading: repairsLoading } = useQuery({
    queryKey: ["/api/repairs", { limit: 5 }],
    retry: false,
  });

  useEffect(() => {
    // Handle unauthorized errors at page level
    const handleError = (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: t("messages.unauthorized"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    };

    // This would be triggered by query errors
    // The actual error handling is done in the query configuration
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

  const statsCards = [
    {
      title: t("dashboard.totalRequests"),
      value: stats?.total || 0,
      icon: ClipboardList,
      color: "text-primary",
      bgColor: "bg-primary",
    },
    {
      title: t("dashboard.pending"),
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500",
    },
    {
      title: t("dashboard.inProgress"),
      value: stats?.inProgress || 0,
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
    },
    {
      title: t("dashboard.completed"),
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-full`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      {statsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <DashboardCharts
          stats={{
            byCategory: stats?.byCategory || {},
            byStatus: stats?.byStatus || {},
          }}
        />
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
