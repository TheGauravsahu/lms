import { useState } from "react";
import { courseApi } from "@/api/courseApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatDate";
import CourseStatus from "../../../components/admin/courses/course-status";
import ErrorOccured from "@/components/error-occured";
import LoadingScreen from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

const COURSE_STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const MyCourses = () => {
  const navigate = useNavigate();
  const { data, isPending, error } = courseApi.useGetAllCourses();
  const editCourseMutation = courseApi.useEditCourse();
  const deleteCourseMutation = courseApi.useDeleteCourse();

  // Edit sheet state
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openEdit = (e, course) => {
    e.stopPropagation();
    setEditTarget({
      course_id: course._id,
      title: course.title,
      validity: course.validity,
      offer_price: course.offer_price,
      original_price: course.original_price,
      status: course.status,
      thumbnail: course.thumbnail?._id || "",
      is_trending: course.is_trending || false,
      is_new: course.is_new || false,
      is_featured: course.is_featured || false,
    });
    setEditOpen(true);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const { course_id, ...edit } = editTarget;
    editCourseMutation.mutate(
      {
        course_id,
        edit: {
          ...edit,
          validity: Number(edit.validity),
          offer_price: Number(edit.offer_price),
          original_price: Number(edit.original_price),
        },
      },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  const openDelete = (e, course) => {
    e.stopPropagation();
    setDeleteTarget(course);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    deleteCourseMutation.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  if (isPending) return <LoadingScreen />;
  if (error) return <ErrorOccured />;

  return (
    <div className="h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h1 className="tracking-tight font-semibold text-2xl">My Courses</h1>

      <div className="flex items-center justify-between">
        <div className="border-b-black border-b-2 pb-1 font-[550] mt-2 w-40">
          <span className="flex items-center">
            All Courses
            <div className="flex items-center justify-center ml-1 bg-secondary rounded-full text-xs p-1 h-5 w-5">
              {data.length}
            </div>
          </span>
        </div>
        <Button
          onClick={() => navigate("/admin/courses/create-course")}
          className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Course
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto mt-4">
        <Table>
          <TableHeader>
            <TableRow className="*:text-muted-foreground *:uppercase">
              <TableHead>Course</TableHead>
              <TableHead className="hidden md:table-cell">Course Id</TableHead>
              <TableHead className="hidden sm:table-cell">Offer Price</TableHead>
              <TableHead className="hidden sm:table-cell">Orig. Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c._id}>
                <TableCell
                  onClick={() => navigate("/admin/courses/" + c._id)}
                  className="p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 sm:w-28 sm:h-20 overflow-hidden rounded-md shrink-0">
                      <img
                        src={c.thumbnail?.url}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h2 className="font-semibold text-sm sm:text-base truncate max-w-[160px] sm:max-w-xs">{c.title}</h2>
                      <span className="text-muted-foreground text-xs">
                        Created: {formatDate(c.createdAt)}
                      </span>
                      <span className="sm:hidden text-xs font-semibold text-orange-600">₹{c.offer_price}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono max-w-[100px] truncate">{c._id}</TableCell>
                <TableCell className="hidden sm:table-cell font-semibold">₹{c.offer_price}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground line-through">₹{c.original_price}</TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    c.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                    c.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {c.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={(e) => openEdit(e, c)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer text-destructive hover:bg-red-50" onClick={(e) => openDelete(e, c)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Course Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Edit Course</SheetTitle>
            <SheetDescription>Update course details and settings.</SheetDescription>
          </SheetHeader>
          {editTarget && (
            <form onSubmit={handleEdit} className="space-y-4 px-6 py-4">
              <div className="space-y-1.5">
                <Label>Course Title</Label>
                <Input value={editTarget.title} onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })} className="rounded-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Offer Price (₹)</Label>
                  <Input type="number" value={editTarget.offer_price} onChange={(e) => setEditTarget({ ...editTarget, offer_price: e.target.value })} className="rounded-sm" min={0} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Original Price (₹)</Label>
                  <Input type="number" value={editTarget.original_price} onChange={(e) => setEditTarget({ ...editTarget, original_price: e.target.value })} className="rounded-sm" min={0} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Validity (days)</Label>
                <Input type="number" value={editTarget.validity} onChange={(e) => setEditTarget({ ...editTarget, validity: e.target.value })} className="rounded-sm" min={1} required />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  value={editTarget.status}
                  onChange={(e) => setEditTarget({ ...editTarget, status: e.target.value })}
                  className="w-full border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {COURSE_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Thumbnail URL</Label>
                <Input value={editTarget.thumbnail} onChange={(e) => setEditTarget({ ...editTarget, thumbnail: e.target.value })} className="rounded-sm" placeholder="https://..." />
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Flags</Label>
                <div className="space-y-2">
                  {[
                    { key: "is_trending", label: "Trending" },
                    { key: "is_new", label: "New" },
                    { key: "is_featured", label: "Featured" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={editTarget[key]}
                        onChange={(e) => setEditTarget({ ...editTarget, [key]: e.target.checked })}
                        className="rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button type="button" variant="outline" className="rounded-sm" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={editCourseMutation.isPending} className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-sm cursor-pointer">
                  {editCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Course Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deleteTarget?.title}"</span>? This will permanently delete all folders and content within this course.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-sm cursor-pointer"
              disabled={deleteCourseMutation.isPending}
              onClick={handleDelete}
            >
              {deleteCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCourses;
