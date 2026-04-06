import { useState } from "react";
import { useListFiles, useDeleteFile, useUpdateFile, getListFilesQueryKey } from "@workspace/api-client-react";
import type { File as ApiFile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Pencil, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const FILE_TYPES = ["Notes", "PYQs", "Lab Manual"];

export default function ManagePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editFile, setEditFile] = useState<ApiFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<ApiFile | null>(null);
  const [editData, setEditData] = useState({ title: "", subject: "", fileType: "", driveLink: "" });

  const params = { search: search || undefined, page, limit: 15 };
  const { data, isLoading } = useListFiles(params, {
    query: { queryKey: getListFilesQueryKey(params) },
  });

  const deleteMutation = useDeleteFile();
  const updateMutation = useUpdateFile();

  const handleDelete = () => {
    if (!deleteFile) return;
    deleteMutation.mutate({ id: deleteFile.id }, {
      onSuccess: () => {
        toast({ title: "Resource deleted" });
        setDeleteFile(null);
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(params) });
      },
      onError: (err: any) => {
        toast({ title: "Delete failed", description: err?.data?.error, variant: "destructive" });
      }
    });
  };

  const handleEdit = () => {
    if (!editFile) return;
    updateMutation.mutate({ id: editFile.id, data: editData }, {
      onSuccess: () => {
        toast({ title: "Resource updated" });
        setEditFile(null);
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(params) });
      },
      onError: (err: any) => {
        toast({ title: "Update failed", description: err?.data?.error, variant: "destructive" });
      }
    });
  };

  const openEdit = (file: ApiFile) => {
    setEditFile(file);
    setEditData({ title: file.title, subject: file.subject, fileType: file.fileType, driveLink: file.driveLink });
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      Notes: "bg-primary/10 text-primary",
      PYQs: "bg-accent/10 text-accent",
      "Lab Manual": "bg-secondary/10 text-secondary",
    };
    return map[type] || "bg-muted text-muted-foreground";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Manage Resources</h1>
            <p className="text-muted-foreground mt-1">
              {data?.total !== undefined ? `${data.total} total resources` : "Edit and delete uploaded files"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Branch / Year</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-4 font-medium text-muted-foreground flex items-center justify-end gap-1">
                      <Download className="h-3.5 w-3.5" /> Downloads
                    </th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : data?.files.map((file) => (
                    <tr key={file.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <span className="font-medium line-clamp-1 max-w-xs">{file.title}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">{file.subject}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className={getTypeColor(file.fileType)}>
                          {file.fileType}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{file.branch}<br />{file.year}</td>
                      <td className="p-4 text-muted-foreground text-xs">{format(new Date(file.uploadDate), "MMM d, yyyy")}</td>
                      <td className="p-4 text-right font-medium">{file.downloads}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(file)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteFile(file)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editFile} onOpenChange={(o) => !o && setEditFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={editData.title} onChange={(e) => setEditData(d => ({ ...d, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input value={editData.subject} onChange={(e) => setEditData(d => ({ ...d, subject: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>File Type</Label>
              <Select value={editData.fileType} onValueChange={(v) => setEditData(d => ({ ...d, fileType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Drive Link</Label>
              <Input value={editData.driveLink} onChange={(e) => setEditData(d => ({ ...d, driveLink: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFile(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteFile} onOpenChange={(o) => !o && setDeleteFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "<strong>{deleteFile?.title}</strong>"? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFile(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
