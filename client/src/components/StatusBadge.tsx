import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "in_progress" | "completed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: t("status.pending"),
        className: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300 shadow-lg shadow-yellow-100/50 dark:from-yellow-900/30 dark:to-yellow-800/20 dark:text-yellow-400 dark:border-yellow-600/30",
      },
      in_progress: {
        label: t("status.inProgress"),
        className: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-300 shadow-lg shadow-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400 dark:border-blue-600/30",
      },
      completed: {
        label: t("status.completed"),
        className: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300 shadow-lg shadow-green-100/50 dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400 dark:border-green-600/30",
      },
    };

    return configs[status as keyof typeof configs] || {
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    };
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

interface UrgencyBadgeProps {
  urgency: "low" | "medium" | "high";
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const { t } = useTranslation();

  const getUrgencyConfig = (urgency: string) => {
    const configs = {
      low: {
        label: t("urgency.low"),
        className: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300 shadow-lg shadow-green-100/50 dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400 dark:border-green-600/30",
      },
      medium: {
        label: t("urgency.medium"),
        className: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300 shadow-lg shadow-yellow-100/50 dark:from-yellow-900/30 dark:to-yellow-800/20 dark:text-yellow-400 dark:border-yellow-600/30",
      },
      high: {
        label: t("urgency.high"),
        className: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300 shadow-lg shadow-red-100/50 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400 dark:border-red-600/30",
      },
    };

    return configs[urgency as keyof typeof configs] || {
      label: urgency,
      className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    };
  };

  const config = getUrgencyConfig(urgency);

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

interface CategoryBadgeProps {
  category: "electrical" | "plumbing" | "hvac" | "furniture" | "other";
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const { t } = useTranslation();

  const getCategoryConfig = (category: string) => {
    const configs = {
      electrical: {
        label: t("categories.electrical"),
        className: "bg-gradient-to-r from-orange-100 to-amber-200 text-orange-800 border-2 border-orange-300 shadow-lg shadow-orange-100/50 dark:from-orange-900/30 dark:to-amber-800/20 dark:text-orange-400 dark:border-orange-600/30",
      },
      plumbing: {
        label: t("categories.plumbing"),
        className: "bg-gradient-to-r from-blue-100 to-sky-200 text-blue-800 border-2 border-blue-300 shadow-lg shadow-blue-100/50 dark:from-blue-900/30 dark:to-sky-800/20 dark:text-blue-400 dark:border-blue-600/30",
      },
      air_conditioning: {
        label: t("categories.hvac"),
        className: "bg-gradient-to-r from-cyan-100 to-teal-200 text-cyan-800 border-2 border-cyan-300 shadow-lg shadow-cyan-100/50 dark:from-cyan-900/30 dark:to-teal-800/20 dark:text-cyan-400 dark:border-cyan-600/30",
      },
      hvac: {
        label: t("categories.hvac"),
        className: "bg-gradient-to-r from-cyan-100 to-teal-200 text-cyan-800 border-2 border-cyan-300 shadow-lg shadow-cyan-100/50 dark:from-cyan-900/30 dark:to-teal-800/20 dark:text-cyan-400 dark:border-cyan-600/30",
      },
      furniture: {
        label: t("categories.furniture"),
        className: "bg-gradient-to-r from-purple-100 to-violet-200 text-purple-800 border-2 border-purple-300 shadow-lg shadow-purple-100/50 dark:from-purple-900/30 dark:to-violet-800/20 dark:text-purple-400 dark:border-purple-600/30",
      },
      other: {
        label: t("categories.other"),
        className: "bg-gradient-to-r from-gray-100 to-slate-200 text-gray-800 border-2 border-gray-300 shadow-lg shadow-gray-100/50 dark:from-gray-900/30 dark:to-slate-800/20 dark:text-gray-400 dark:border-gray-600/30",
      },
    };

    return configs[category as keyof typeof configs] || {
      label: category,
      className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    };
  };

  const config = getCategoryConfig(category);

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}