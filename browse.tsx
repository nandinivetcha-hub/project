import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListFiles, useListBookmarks, getListFilesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { ResourceCard } from "@/components/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const BRANCHES = ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];
const FILE_TYPES = ["Notes", "PYQs", "Lab Manual"];
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "downloads", label: "Most Downloaded" },
  { value: "alphabetical", label: "Alphabetical" },
];

export default function BrowsePage() {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const getSearchParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || "",
      branch: params.get("branch") || "",
      year: params.get("year") || "",
      semester: params.get("semester") || "",
      subject: params.get("subject") || "",
      fileType: params.get("fileType") || "",
    };
  };

  const initialParams = getSearchParams();
  const [search, setSearch] = useState(initialParams.search);
  const [branch, setBranch] = useState(initialParams.branch);
  const [year, setYear] = useState(initialParams.year);
  const [semester, setSemester] = useState(initialParams.semester);
  const [subject, setSubject] = useState(initialParams.subject);
  const [fileType, setFileType] = useState(initialParams.fileType);
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const p = getSearchParams();
    setSearch(p.search);
    setBranch(p.branch);
    setYear(p.year);
    setSemester(p.semester);
    setSubject(p.subject);
    setFileType(p.fileType);
    setPage(1);
  }, [location]);

  const filterParams = {
    search: search || undefined,
    branch: branch || undefined,
    year: year || undefined,
    semester: semester || undefined,
    subject: subject || undefined,
    fileType: fileType || undefined,
    sortBy: sortBy || undefined,
    page,
    limit: 12,
  };

  const { data, isLoading } = useListFiles(filterParams, {
    query: { queryKey: getListFilesQueryKey(filterParams) },
  });

  const { data: bookmarksData } = useListBookmarks();
  const bookmarkedIds = new Set(bookmarksData?.map((b) => b.fileId) || []);

  const clearFilters = () => {
    setSearch("");
    setBranch("");
    setYear("");
    setSemester("");
    setSubject("");
    setFileType("");
    setPage(1);
  };

  const hasFilters = search || branch || year || semester || subject || fileType;

  const activeFilters = [
    { label: branch, clear: () => setBranch("") },
    { label: year, clear: () => setYear("") },
    { label: semester, clear: () => setSemester("") },
    { label: subject, clear: () => setSubject("") },
    { label: fileType, clear: () => setFileType("") },
  ].filter((f) => f.label);

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Browse Resources</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total !== undefined ? `${data.total} resource${data.total !== 1 ? "s" : ""} available` : "Explore academic materials"}
          </p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, subject, keywords..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <Select value={branch || "all"} onValueChange={(v) => { setBranch(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={year || "all"} onValueChange={(v) => { setYear(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={semester || "all"} onValueChange={(v) => { setSemester(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Semester" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={fileType || "all"} onValueChange={(v) => { setFileType(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="File Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} size="sm" className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" /> Clear all
              </Button>
            )}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f) => (
                <Badge key={f.label} variant="secondary" className="flex items-center gap-1 cursor-pointer" onClick={f.clear}>
                  {f.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-lg" />
            ))}
          </div>
        ) : data?.files && data.files.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {data.files.map((file, i) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <ResourceCard
                    file={file}
                    isBookmarked={bookmarkedIds.has(file.id)}
                    onBookmarkToggle={() => queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(filterParams) })}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <Filter className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No resources found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
