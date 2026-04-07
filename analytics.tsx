import { useGetAdminDashboard, useGetDownloadsOverTime } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

const PIE_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminDashboard();
  const { data: downloadsData, isLoading: dlLoading } = useGetDownloadsOverTime({ days: 30 }, {
    query: { enabled: true },
  });

  const chartData = downloadsData?.map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    downloads: d.downloads,
  })) || [];

  const pieData = stats?.filesByType.map((item, i) => ({
    name: item.fileType,
    value: item.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Monitor usage patterns and resource performance.</p>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Files", value: stats?.totalFiles },
            { label: "Total Downloads", value: stats?.totalDownloads },
            { label: "Active Students", value: stats?.totalStudents },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{item.value?.toLocaleString() ?? 0}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Downloads Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Downloads — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {dlLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                  <Line type="monotone" dataKey="downloads" stroke="#4F46E5" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No download data available yet. Downloads will appear here once students start using the platform.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* File Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Files by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Top Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Top Subjects by File Count</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : stats?.topSubjects && stats.topSubjects.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.topSubjects.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="subject" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
