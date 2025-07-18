import React, { memo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useLanguage } from "@/hooks/useLanguage";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RepairBarChartProps {
  data: Record<string, number>;
  size?: "sm" | "md" | "lg";
  title?: string;
  orientation?: "vertical" | "horizontal";
}

const chartSizes = {
  sm: { width: 300, height: 200 },
  md: { width: 400, height: 300 },
  lg: { width: 500, height: 400 },
};

const RepairBarChart = memo(({ 
  data, 
  size = "md", 
  title, 
  orientation = "vertical" 
}: RepairBarChartProps) => {
  const { t } = useLanguage();
  const chartSize = chartSizes[size];

  console.log('RepairBarChart data:', data);

  // Early return if no data
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No status data available</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: "#F59E0B", // Amber
    in_progress: "#3B82F6", // Blue
    completed: "#10B981", // Green
  };

  const chartData = {
    labels: Object.keys(data).map((key) => t(`status.${key}`)),
    datasets: [
      {
        label: t("dashboard.repairCount"),
        data: Object.values(data),
        backgroundColor: Object.keys(data).map(
          (key) => statusColors[key as keyof typeof statusColors] || "#6B7280"
        ),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: orientation === "horizontal" ? "y" as const : "x" as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}`;
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
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div style={{ width: chartSize.width, height: chartSize.height }}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <Bar data={chartData} options={options} />
    </div>
  );
});

RepairBarChart.displayName = "RepairBarChart";

export { RepairBarChart };