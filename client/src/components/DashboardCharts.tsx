import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface DashboardChartsProps {
  stats: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const { t } = useTranslation();
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const statusChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartInstance = useRef<Chart | null>(null);
  const statusChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!categoryChartRef.current || !statusChartRef.current) return;

    // Destroy existing charts
    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }
    if (statusChartInstance.current) {
      statusChartInstance.current.destroy();
    }

    // Category Pie Chart
    const categoryCtx = categoryChartRef.current.getContext("2d");
    if (categoryCtx) {
      categoryChartInstance.current = new Chart(categoryCtx, {
        type: "pie",
        data: {
          labels: Object.keys(stats.byCategory).map((key) =>
            t(`categories.${key}`)
          ),
          datasets: [
            {
              data: Object.values(stats.byCategory),
              backgroundColor: [
                "hsl(207, 90%, 54%)", // primary
                "hsl(207, 90%, 64%)", // primary-light
                "hsl(39, 100%, 50%)", // warning
                "hsl(142, 76%, 47%)", // success
                "hsl(215, 20%, 65%)", // muted
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    }

    // Status Bar Chart
    const statusCtx = statusChartRef.current.getContext("2d");
    if (statusCtx) {
      // Mock weekly data for demonstration
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const pendingData = [12, 8, 15, 9, 6, 3, 7];
      const inProgressData = [8, 12, 10, 14, 11, 6, 9];
      const completedData = [5, 9, 12, 8, 15, 10, 11];

      statusChartInstance.current = new Chart(statusCtx, {
        type: "bar",
        data: {
          labels: weekDays,
          datasets: [
            {
              label: t("status.pending"),
              data: pendingData,
              backgroundColor: "hsl(39, 100%, 50%)", // warning
            },
            {
              label: t("status.in_progress"),
              data: inProgressData,
              backgroundColor: "hsl(207, 90%, 54%)", // primary
            },
            {
              label: t("status.completed"),
              data: completedData,
              backgroundColor: "hsl(142, 76%, 47%)", // success
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
    };
  }, [stats, t]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.repairCategories")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64">
            <canvas ref={categoryChartRef} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.weeklyOverview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64">
            <canvas ref={statusChartRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
