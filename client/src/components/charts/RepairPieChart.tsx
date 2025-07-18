import { memo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RepairPieChartProps {
  data: Record<string, number>;
  title: string;
  colors?: string[];
  size?: "sm" | "md" | "lg";
}

const RepairPieChart = memo(({ data, title, colors, size = "md" }: RepairPieChartProps) => {
  const { t } = useTranslation();

  const defaultColors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // amber
    "#8B5CF6", // purple
    "#F97316", // orange
    "#06B6D4", // cyan
  ];

  const chartColors = colors || defaultColors;

  const chartData = {
    labels: Object.keys(data).map(key => t(`categories.${key}`) || key),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: chartColors.slice(0, Object.keys(data).length),
        borderColor: chartColors.slice(0, Object.keys(data).length).map(color => color + "CC"),
        borderWidth: 2,
        hoverBorderWidth: 3,
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
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
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
          <Pie data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
});

RepairPieChart.displayName = "RepairPieChart";

export { RepairPieChart };