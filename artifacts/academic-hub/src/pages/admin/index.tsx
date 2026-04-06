import AdminLayout from "@/components/AdminLayout";
import { useGetAdminDashboard, useListAnnouncements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Users, TrendingUp, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminDashboard();
  const { data: announcements, isLoading: annLoading } = useListAnnouncements();

  const statCards = [
    { label: "Total Files", value: stats?.totalFiles, icon: FileText, color: "text-primary" },
    { label: "Total Downloads", value: stats?.totalDownloads, icon: Download, color: "text-secondary" },
    { label: "Downloads Today", value: stats?.downloadsToday, icon: TrendingUp, color: "text-accent" },
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-muted-foreground" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Control Panel</h1>
            <p className="text-muted-foreground mt-1">Manage resources, announcements, and monitor activity.</p>
          </div>
          <Button asChild>
            <Link href="/admin/upload"><Plus className="h-4 w-4 mr-2" /> Upload Resource</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold">{card.value?.toLocaleString() ?? 0}</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* File Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Files by Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
              ) : stats?.filesByType.map((item) => {
                const total = stats.totalFiles || 1;
                const pct = Math.round((item.count / total) * 100);
                const colors: Record<string, string> = { Notes: "bg-primary", PYQs: "bg-accent", "Lab Manual": "bg-secondary" };
                const color = colors[item.fileType] || "bg-muted";
                return (
                  <div key={item.fileType} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.fileType}</span>
                      <span className="font-medium">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Announcements</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/announcements">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {annLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : announcements && announcements.length > 0 ? (
                announcements.slice(0, 3).map((ann) => {
                  const priorityColors: Record<string, string> = { urgent: "destructive", warning: "outline", info: "secondary" };
                  return (
                    <div key={ann.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Bell className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{ann.title}</p>
                          <Badge variant={(priorityColors[ann.priority] || "secondary") as "destructive" | "secondary" | "outline"} className="text-xs shrink-0">
                            {ann.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{format(new Date(ann.datePosted), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No announcements yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
