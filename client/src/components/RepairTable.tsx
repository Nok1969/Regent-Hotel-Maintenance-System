import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RepairTableProps {
  filters?: {
    status?: string;
    category?: string;
  };
}

export function RepairTable({ filters }: RepairTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(filters?.status || "");
  const [categoryFilter, setCategoryFilter] = useState(filters?.category || "");

  const { data: repairs = [], isLoading } = useQuery({
    queryKey: ["/api/repairs", { page, status: statusFilter, category: categoryFilter }],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/repairs/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("messages.success"),
        description: t("messages.repairUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      in_progress: "default",
      completed: "success",
    } as const;

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

  const categories = [
    { value: "", label: t("repair.allCategories") },
    { value: "electrical", label: t("categories.electrical") },
    { value: "plumbing", label: t("categories.plumbing") },
    { value: "air_conditioning", label: t("categories.air_conditioning") },
    { value: "furniture", label: t("categories.furniture") },
    { value: "other", label: t("categories.other") },
  ];

  const statuses = [
    { value: "", label: t("repair.allStatus") },
    { value: "pending", label: t("status.pending") },
    { value: "in_progress", label: t("status.in_progress") },
    { value: "completed", label: t("status.completed") },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("repair.repairHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("repair.repairHistory")}</CardTitle>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder={t("repair.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder={t("repair.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repairs.map((repair: any) => (
              <Card key={repair.id} className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      #{repair.id} - {repair.room}
                    </span>
                    {getPriorityBadge(repair.urgency)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t(`categories.${repair.category}`)}: {repair.description.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between">
                    {user?.role === "admin" ? (
                      <Select
                        value={repair.status}
                        onValueChange={(status) => handleStatusChange(repair.id, status)}
                      >
                        <SelectTrigger className="w-auto h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("status.pending")}</SelectItem>
                          <SelectItem value="in_progress">{t("status.in_progress")}</SelectItem>
                          <SelectItem value="completed">{t("status.completed")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(repair.status)
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(repair.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t("repair.repairHistory")}</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder={t("repair.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder={t("repair.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.id")}</TableHead>
                <TableHead>{t("table.room")}</TableHead>
                <TableHead>{t("table.category")}</TableHead>
                <TableHead>{t("table.description")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.priority")}</TableHead>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((repair: any) => (
                <TableRow key={repair.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{repair.id}</TableCell>
                  <TableCell>{repair.room}</TableCell>
                  <TableCell>{t(`categories.${repair.category}`)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {repair.description}
                  </TableCell>
                  <TableCell>
                    {user?.role === "admin" ? (
                      <Select
                        value={repair.status}
                        onValueChange={(status) => handleStatusChange(repair.id, status)}
                      >
                        <SelectTrigger className="w-auto h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("status.pending")}</SelectItem>
                          <SelectItem value="in_progress">{t("status.in_progress")}</SelectItem>
                          <SelectItem value="completed">{t("status.completed")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(repair.status)
                    )}
                  </TableCell>
                  <TableCell>{getPriorityBadge(repair.urgency)}</TableCell>
                  <TableCell>
                    {new Date(repair.createdAt).toLocaleDateString()} {new Date(repair.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {repairs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("messages.noResults")}</p>
          </div>
        )}

        {repairs.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {t("table.showing")} 1 {t("table.to")} {repairs.length} {t("table.of")} {repairs.length} {t("table.results")}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                {t("table.previous")}
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                {page}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={repairs.length < 10}
              >
                {t("table.next")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
