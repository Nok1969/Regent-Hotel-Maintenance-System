import { memo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RepairAreaChartProps {
  data: Array<{ month: string; count: number }>;
  title: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const RepairAreaChart = memo(({ 
  data, 
  title, 
  color = "#3B82F6", 
  size = "md" 
}: RepairAreaChartProps) => {
  const { t } = useTranslation();

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: t("charts.repairs"),
        data: data.map(item => item.count),
        borderColor: color,
        backgroundColor: color + "20", // Very transparent fill
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
    ...getSizeConfig(),
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
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
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  if (data.length === 0) {
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
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
});

RepairAreaChart.displayName = "RepairAreaChart";

export { RepairAreaChart };