import React, { memo } from "react";
import { Line } from "react-chartjs-2";
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
  ChartOptions,
} from "chart.js";
import { useLanguage } from "@/hooks/useLanguage";

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

interface MonthlyData {
  month: string;
  count: number;
  completed: number;
}

interface RepairAreaChartProps {
  data: MonthlyData[];
  size?: "sm" | "md" | "lg";
  title?: string;
}

const chartSizes = {
  sm: { width: 350, height: 200 },
  md: { width: 450, height: 300 },
  lg: { width: 550, height: 400 },
};

const RepairAreaChart = memo(({ data, size = "md", title }: RepairAreaChartProps) => {
  const { t } = useLanguage();
  const chartSize = chartSizes[size];

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: t("dashboard.totalRepairs"),
        data: data.map(item => item.count),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "rgba(255, 255, 255, 1)",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
      },
      {
        label: t("dashboard.completedRepairs"),
        data: data.map(item => item.completed),
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "rgba(255, 255, 255, 1)",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return `${context[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: t("dashboard.month"),
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: t("dashboard.repairCount"),
        },
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
      <Line data={chartData} options={options} />
    </div>
  );
});

RepairAreaChart.displayName = "RepairAreaChart";

export { RepairAreaChart };