import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DashboardChartsProps {
  stats: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const { t } = useTranslation();

  const categoryData = Object.entries(stats.byCategory).map(([category, count]) => ({
    category: t(`categories.${category}`),
    count,
  }));

  const statusData = Object.entries(stats.byStatus).map(([status, count]) => ({
    status: t(`status.${status}`),
    count,
  }));

  const statusColors = {
    pending: '#fbbf24',
    in_progress: '#3b82f6',
    completed: '#10b981',
  };

  const categoryColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("charts.byCategory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("charts.byStatus")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status.toLowerCase() as keyof typeof statusColors] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}