import { useState } from "react";
import { useListAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import type { Announcement } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertTriangle, Info, BellRing } from "lucide-react";
import { format } from "date-fns";

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: announcements, isLoading } = useListAnnouncements();

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "info" });

  const resetForm = () => setFormData({ title: "", description: "", priority: "info" });

  const handleCreate = () => {
    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Announcement created" });
        setShowCreate(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    });
  };

  const handleUpdate = () => {
    if (!editItem) return;
    updateMutation.mutate({ id: editItem.id, data: formData }, {
      onSuccess: () => {
        toast({ title: "Announcement updated" });
        setEditItem(null);
        resetForm();
        queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteMutation.mutate({ id: deleteItem.id }, {
      onSuccess: () => {
        toast({ title: "Announcement deleted" });
        setDeleteItem(null);
        queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
      },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    });
  };

  const openEdit = (item: Announcement) => {
    setEditItem(item);
    setFormData({ title: item.title, description: item.description, priority: item.priority });
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (priority === "warning") return <BellRing className="h-4 w-4 text-amber-500" />;
    return <Info className="h-4 w-4 text-primary" />;
  };

  const getPriorityBadge = (priority: string): "destructive" | "outline" | "secondary" => {
    if (priority === "urgent") return "destructive";
    if (priority === "warning") return "outline";
    return "secondary";
  };

  const AnnouncementForm = ({ onSubmit, isPending }: { onSubmit: () => void; isPending: boolean }) => (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={formData.title} onChange={(e) => setFormData(d => ({ ...d, title: e.target.value }))} placeholder="Announcement title" />
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))} placeholder="Announcement content..." rows={4} />
      </div>
      <div className="space-y-1">
        <Label>Priority</Label>
        <Select value={formData.priority} onValueChange={(v) => setFormData(d => ({ ...d, priority: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => { setShowCreate(false); setEditItem(null); resetForm(); }}>Cancel</Button>
        <Button onClick={onSubmit} disabled={isPending || !formData.title || !formData.description}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground mt-1">Communicate with students across the platform.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowCreate(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Announcement
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          ) : announcements && announcements.length > 0 ? (
            announcements.map((ann) => (
              <Card key={ann.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getPriorityIcon(ann.priority)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{ann.title}</h3>
                          <Badge variant={getPriorityBadge(ann.priority)} className="text-xs capitalize">
                            {ann.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{ann.description}</p>
                        <span className="text-xs text-muted-foreground">
                          Posted {format(new Date(ann.datePosted), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ann)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteItem(ann)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <BellRing className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold">No announcements</h3>
              <p className="text-muted-foreground text-sm">Create your first announcement to communicate with students.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <AnnouncementForm onSubmit={handleCreate} isPending={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
          <AnnouncementForm onSubmit={handleUpdate} isPending={updateMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Announcement</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete "<strong>{deleteItem?.title}</strong>"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
