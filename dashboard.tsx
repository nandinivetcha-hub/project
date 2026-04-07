import { useGetStudentStats, useListAnnouncements, useGetRecentFiles, useGetTrendingFiles, useListBookmarks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceCard } from "@/components/ResourceCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AlertTriangle, Info, BellRing, Download, Heart, FileText, Search, Library } from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useGetStudentStats();
  const { data: announcements, isLoading: announcementsLoading } = useListAnnouncements();
  const { data: recentFiles, isLoading: recentLoading } = useGetRecentFiles({ limit: 6 });
  const { data: trendingFiles, isLoading: trendingLoading } = useGetTrendingFiles({ limit: 4 });
  const { data: bookmarksData } = useListBookmarks();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-destructive bg-destructive/10 border-destructive/20";
      case "warning": return "text-accent bg-accent/10 border-accent/20";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning": return <BellRing className="h-5 w-5 text-accent" />;
      default: return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const bookmarkedIds = new Set(bookmarksData?.map(b => b.fileId) || []);

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Student'}</h1>
            <p className="text-muted-foreground mt-1">Discover what's new in your academic library.</p>
          </div>
          <form onSubmit={handleSearch} className="w-full md:w-auto relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search subjects, topics, PYQs..." 
              className="w-full md:w-[300px] pl-9 bg-card focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary text-primary-foreground border-primary-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">New Resources</CardTitle>
              <Library className="h-4 w-4 text-primary-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-16 bg-primary-foreground/20" /> : stats?.newFilesThisWeek || 0}</div>
              <p className="text-xs text-primary-foreground/60 mt-1">added this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalDownloads || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">lifetime total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalBookmarks || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">in your bookmarks</p>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        {!announcementsLoading && announcements && announcements.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BellRing className="h-5 w-5" /> Announcements
            </h2>
            <Carousel className="w-full" opts={{ align: "start" }}>
              <CarouselContent>
                {announcements.map((announcement) => (
                  <CarouselItem key={announcement.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className={`border h-full ${getPriorityColor(announcement.priority)}`}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          {getPriorityIcon(announcement.priority)}
                          <span className="text-xs opacity-70">
                            {format(new Date(announcement.datePosted), "MMM d")}
                          </span>
                        </div>
                        <CardTitle className="text-base mt-2">{announcement.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm opacity-90 line-clamp-2">{announcement.description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end gap-2 mt-4 hidden md:flex pr-4">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recently Added */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Recently Added
                </h2>
                <Link href="/browse" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              
              {recentLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
              ) : recentFiles && recentFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentFiles.map(file => (
                    <ResourceCard key={file.id} file={file} isBookmarked={bookmarkedIds.has(file.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-card border rounded-lg">
                  <p className="text-muted-foreground">No resources found.</p>
                </div>
              )}
            </div>

            {/* Trending */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5" /> Trending Resources
                </h2>
              </div>
              
              {trendingLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
              ) : trendingFiles && trendingFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trendingFiles.map(file => (
                    <ResourceCard key={file.id} file={file} isBookmarked={bookmarkedIds.has(file.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-card border rounded-lg">
                  <p className="text-muted-foreground">No trending resources yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area - 1/3 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse by Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Computer Science", "Electronics", "Mechanical"].map(branch => (
                  <div key={branch} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                    <Link href={`/browse?branch=${encodeURIComponent(branch)}`} className="font-medium hover:text-primary block">
                      {branch}
                    </Link>
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <Link href={`/browse?branch=${encodeURIComponent(branch)}&year=1st Year`} className="hover:text-foreground">1st Yr</Link>
                      <span>•</span>
                      <Link href={`/browse?branch=${encodeURIComponent(branch)}&year=2nd Year`} className="hover:text-foreground">2nd Yr</Link>
                      <span>•</span>
                      <Link href={`/browse?branch=${encodeURIComponent(branch)}&year=3rd Year`} className="hover:text-foreground">3rd Yr</Link>
                      <span>•</span>
                      <Link href={`/browse?branch=${encodeURIComponent(branch)}&year=4th Year`} className="hover:text-foreground">4th Yr</Link>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/browse">Explore All Structure</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-secondary">Study Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Exams are approaching! We've curated the most downloaded previous year questions and notes.
                </p>
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" asChild>
                  <Link href="/browse?fileType=PYQs">View PYQs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
