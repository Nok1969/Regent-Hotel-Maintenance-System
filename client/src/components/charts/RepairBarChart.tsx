import { memo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RepairBarChartProps {
  data: Record<string, number>;
  title: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  horizontal?: boolean;
}

const RepairBarChart = memo(({ 
  data, 
  title, 
  color = "#3B82F6", 
  size = "md", 
  horizontal = false 
}: RepairBarChartProps) => {
  const { t } = useTranslation();

  const chartData = {
    labels: Object.keys(data).map(key => t(`status.${key}`) || t(`urgency.${key}`) || key),
    datasets: [
      {
        label: t("charts.count"),
        data: Object.values(data),
        backgroundColor: color + "80", // Add transparency
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { height: 200, maintainAspectRatio: false };
      case "lg":
        return { height: 400, maintainAspectRatio: false };
      default:
        return { height: 300, maintainAspectRatio: false };
    }
  };

  const options = {
    responsive: true,
    indexAxis: horizontal ? "y" as const : "x" as const,
    ...getSizeConfig(),
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.y || context.parsed.x}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  if (Object.keys(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            {t("charts.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
});

RepairBarChart.displayName = "RepairBarChart";

export { RepairBarChart };