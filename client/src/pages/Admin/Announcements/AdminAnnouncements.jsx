import { useState } from "react";
import { announcementApi } from "@/api/announcementApi";
import { courseApi } from "@/api/courseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Megaphone, Plus, Trash2, Calendar, Loader2, BookOpen, AlertCircle } from "lucide-react";
import ErrorOccured from "@/components/error-occured";
import LoadingScreen from "@/components/loading-screen";
import { formatDate } from "@/lib/formatDate";

const AdminAnnouncements = () => {
  const { data: announcements = [], isPending, isError } = announcementApi.useGetAnnouncements();
  const { data: coursesData } = courseApi.useGetAllCourses();
  const createMutation = announcementApi.useCreateAnnouncement();
  const deleteMutation = announcementApi.useDeleteAnnouncement();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", courseId: "all" });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Extract course list array correctly since courses API is now paginated if parameters are sent.
  // When called without params (like in sidebar or forums), it returns courses directly as an array.
  const courses = Array.isArray(coursesData) ? coursesData : coursesData?.courses || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;

    createMutation.mutate(
      {
        title: form.title,
        body: form.body,
        courseId: form.courseId === "all" ? null : form.courseId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ title: "", body: "", courseId: "all" });
        },
      }
    );
  };

  const openDelete = (ann) => {
    setDeleteTarget(ann);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  if (isPending) return <LoadingScreen />;
  if (isError) return <ErrorOccured />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Send global updates or course-specific notifications to students.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-linear-to-b from-orange-400 to-red-500 text-white cursor-pointer rounded-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </Button>
      </div>

      {/* Announcements Table */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="*:text-muted-foreground *:uppercase">
                <TableHead>Target Scope</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No announcements sent yet.
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((ann) => (
                  <TableRow key={ann._id}>
                    <TableCell>
                      {ann.courseId ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
                          <BookOpen className="w-3 h-3" />
                          {ann.courseId.title}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                          <AlertCircle className="w-3 h-3" />
                          Global
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold max-w-[200px] truncate" title={ann.title}>
                      {ann.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(ann.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ann.createdBy?.name || "Instructor"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 cursor-pointer text-destructive hover:bg-red-50"
                        onClick={() => openDelete(ann)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Announcement</DialogTitle>
            <DialogDescription>Compose a message to notify students.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Title *</Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter title (e.g. Live Q&A Scheduled)"
                required
                className="rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-course">Target Course *</Label>
              <select
                id="ann-course"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">Global (All Enrolled Students)</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-body">Announcement Body *</Label>
              <Textarea
                id="ann-body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Write your announcement message here..."
                required
                className="min-h-[120px] rounded-sm"
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" className="rounded-sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-sm cursor-pointer"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-sm cursor-pointer"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnnouncements;
