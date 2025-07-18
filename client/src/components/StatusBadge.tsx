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
        className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      },
      in_progress: {
        label: t("status.inProgress"),
        className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      },
      completed: {
        label: t("status.completed"),
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
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
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      },
      medium: {
        label: t("urgency.medium"),
        className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      },
      high: {
        label: t("urgency.high"),
        className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
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
        className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      },
      plumbing: {
        label: t("categories.plumbing"),
        className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      },
      hvac: {
        label: t("categories.hvac"),
        className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      },
      furniture: {
        label: t("categories.furniture"),
        className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
      },
      other: {
        label: t("categories.other"),
        className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
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