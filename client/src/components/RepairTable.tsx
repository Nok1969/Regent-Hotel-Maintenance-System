import { useState, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format, formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedSearch } from "@/hooks/useDebounce";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge, UrgencyBadge, CategoryBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Eye, Filter, X } from "lucide-react";

interface RepairTableProps {
  filters?: {
    status?: string;
    category?: string;
  };
}

export function RepairTable({ filters: initialFilters }: RepairTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    status: initialFilters?.status || "all",
    category: initialFilters?.category || "all",
  });

  // Debounce search input to avoid too many API calls
  const { debouncedQuery: debouncedSearch, isSearching } = useDebouncedSearch(searchInput, 500);

  const { data: repairs = [], isLoading } = useQuery({
    queryKey: ["repairs", "list", { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filters to query params
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      
      const response = await fetch(`/api/repairs?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch repairs: ${response.status}`);
      }
      return response.json();
    },
    retry: false,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 30000, // Auto-refresh every 30 seconds for real-time updates
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/repairs/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: t("messages.success"),
        description: t("messages.statusUpdated"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("messages.error"),
        description: error.message || t("messages.updateFailed"),
        variant: "destructive",
      });
    },
  });

  const acceptJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/repairs/${id}`, { 
        status: "in_progress",
        assignedTo: user?.id 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: t("messages.success"),
        description: t("messages.jobAccepted"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("messages.error"),
        description: error.message || t("messages.acceptFailed"),
        variant: "destructive",
      });
    },
  });

  const cancelJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/repairs/${id}`, { 
        status: "pending",
        assignedTo: null 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: t("messages.success"),
        description: t("messages.jobCancelled"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("messages.error"),
        description: error.message || t("messages.cancelFailed"),
        variant: "destructive",
      });
    },
  });

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

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
      <Badge className={colors[urgency as keyof typeof colors]}>
        {t(`urgency.${urgency}`)}
      </Badge>
    );
  };

  const canUpdateStatus = (repair: any) => {
    if (!user?.permissions) return false;
    return user.permissions.canUpdateRepairStatus;
  };

  const canAcceptJob = (repair: any) => {
    if (!user?.permissions) return false;
    return user.permissions.canAcceptJobs && repair.status === "pending";
  };

  const canCancelJob = (repair: any) => {
    if (!user?.permissions) return false;
    return user.permissions.canCancelJobs && repair.status !== "completed";
  };

  const clearFilters = () => {
    setFilters({ status: "all", category: "all" });
    setSearchInput("");
  };

  // No need for client-side filtering since we're using debounced API calls
  const filteredRepairs = repairs;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("repairs.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("repairs.title")}</span>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">
              {filteredRepairs.length} {t("repairs.items")}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="space-y-2">
            <Label className="text-sm">{t("filters.search")}</Label>
            <div className="relative">
              <Input
                placeholder={t("filters.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="text-sm"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t("filters.status")}</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="in_progress">{t("status.in_progress")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t("filters.category")}</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
                <SelectItem value="electrical">{t("categories.electrical")}</SelectItem>
                <SelectItem value="plumbing">{t("categories.plumbing")}</SelectItem>
                <SelectItem value="air_conditioning">{t("categories.hvac")}</SelectItem>
                <SelectItem value="furniture">{t("categories.furniture")}</SelectItem>
                <SelectItem value="other">{t("categories.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              {t("filters.clear")}
            </Button>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="block sm:hidden space-y-3">
          {filteredRepairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("repairs.noRepairs")}
            </div>
          ) : (
            filteredRepairs.map((repair: any) => (
              <Card key={repair.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">ห้อง {repair.room}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(repair.createdAt), "dd/MM/yyyy HH:mm", { locale: th })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {user?.permissions?.canUpdateRepairStatus && (
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <CategoryBadge category={repair.category as any} />
                    <StatusBadge status={repair.status as any} />
                    <UrgencyBadge urgency={repair.urgency as any} />
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repair.description}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm">ห้อง</TableHead>
                <TableHead className="text-sm">ประเภท</TableHead>
                <TableHead className="text-sm">สถานะ</TableHead>
                <TableHead className="text-sm">ความเร่งด่วน</TableHead>
                <TableHead className="text-sm">วันที่</TableHead>
                <TableHead className="text-sm">เวลา</TableHead>
                <TableHead className="text-sm">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {t("repairs.noRepairs")}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRepairs.map((repair: any) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[120px] truncate" title={repair.room}>
                        {repair.room}
                      </div>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={repair.category as any} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={repair.status as any} />
                    </TableCell>
                    <TableCell>
                      <UrgencyBadge urgency={repair.urgency as any} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(repair.createdAt), "d/M/yyyy", { locale: th })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatDistanceToNow(new Date(repair.createdAt), { addSuffix: true, locale: th })}
                        </div>
                        <div className="text-[10px] text-muted-foreground/70">
                          {format(new Date(repair.createdAt), "HH:mm น.", { locale: th })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{t("repairs.details")}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong className="text-sm text-muted-foreground">{t("table.location")}:</strong>
                                  <p className="mt-1">{repair.room}</p>
                                </div>
                                <div>
                                  <strong className="text-sm text-muted-foreground">{t("table.reporter")}:</strong>
                                  <p className="mt-1">{repair.user?.firstName} {repair.user?.lastName}</p>
                                </div>
                              </div>
                              
                              <div>
                                <strong className="text-sm text-muted-foreground">{t("table.description")}:</strong>
                                <p className="mt-1 p-3 bg-muted rounded-md">{repair.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <strong className="text-sm text-muted-foreground">{t("table.category")}:</strong>
                                  <div className="mt-2">
                                    <CategoryBadge category={repair.category as any} />
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-sm text-muted-foreground">{t("table.urgency")}:</strong>
                                  <div className="mt-2">
                                    <UrgencyBadge urgency={repair.urgency as any} />
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-sm text-muted-foreground">{t("table.status")}:</strong>
                                  <div className="mt-2">
                                    <StatusBadge status={repair.status as any} />
                                  </div>
                                </div>
                              </div>
                              
                              {repair.images && repair.images.length > 0 && (
                                <div>
                                  <strong className="text-sm text-muted-foreground">{t("forms.images")}:</strong>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {repair.images.map((image: string, index: number) => (
                                      <img
                                        key={index}
                                        src={`/uploads/${image}`}
                                        alt={`Repair ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-md border"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {canAcceptJob(repair) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => acceptJobMutation.mutate(repair.id)}
                            disabled={acceptJobMutation.isPending}
                          >
                            {t("table.acceptJob")}
                          </Button>
                        )}
                        
                        {canCancelJob(repair) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelJobMutation.mutate(repair.id)}
                            disabled={cancelJobMutation.isPending}
                          >
                            {t("table.cancelJob")}
                          </Button>
                        )}

                        {canUpdateStatus(repair) && (
                          <Select
                            value={repair.status}
                            onValueChange={(value) => 
                              updateStatusMutation.mutate({ id: repair.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t("status.pending")}</SelectItem>
                              <SelectItem value="in_progress">{t("status.in_progress")}</SelectItem>
                              <SelectItem value="completed">{t("status.completed")}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}