import React, { memo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useLanguage } from "@/hooks/useLanguage";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RepairPieChartProps {
  data: Record<string, number>;
  size?: "sm" | "md" | "lg";
  title?: string;
}

const chartSizes = {
  sm: { width: 250, height: 200 },
  md: { width: 350, height: 280 },
  lg: { width: 450, height: 360 },
};

const RepairPieChart = memo(({ data, size = "md", title }: RepairPieChartProps) => {
  const { t } = useLanguage();
  const chartSize = chartSizes[size];

  const categoryColors = {
    electrical: "#3B82F6", // Blue
    plumbing: "#10B981", // Green
    air_conditioning: "#F59E0B", // Amber (air conditioning)
    furniture: "#8B5CF6", // Purple
    other: "#6B7280", // Gray
  };

  const chartData = {
    labels: Object.keys(data).map((key) => t(`categories.${key}`)),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: Object.keys(data).map(
          (key) => categoryColors[key as keyof typeof categoryColors] || "#6B7280"
        ),
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.8)",
        hoverBorderWidth: 3,
        hoverBorderColor: "rgba(255, 255, 255, 1)",
      },
    ],
  };

  // Debug: log data to check if it's being passed correctly
  console.log('RepairPieChart data:', data, 'chartData:', chartData);

  // Early return if no data
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No category data available</p>
        </div>
      </div>
    );
  }

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
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
          label: (context) => {
            const total = context.dataset.data.reduce((sum, value) => sum + (value as number), 0);
            const percentage = (((context.raw as number) / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: chartSize.width, height: chartSize.height }}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <Pie data={chartData} options={options} />
    </div>
  );
});

RepairPieChart.displayName = "RepairPieChart";

export { RepairPieChart };