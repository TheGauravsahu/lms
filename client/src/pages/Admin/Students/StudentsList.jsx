import { useState } from "react";
import { studentApi } from "@/api/studentApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  Phone,
  Mail,
  Shield,
  Search,
} from "lucide-react";
import ErrorOccured from "@/components/error-occured";

const STATUS_OPTIONS = ["ACTIVE", "BLOCKED", "ARCHIVED", "UNVERIFIED"];

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    UNVERIFIED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.UNVERIFIED}`}>
      {status}
    </span>
  );
};

const StudentsList = () => {
  const { data: students, isPending, isError } = studentApi.useGetAllStudents();
  const addStudent = studentApi.useAddStudent();
  const editStudent = studentApi.useEditStudent();
  const deleteStudent = studentApi.useDeleteStudent();

  const [search, setSearch] = useState("");

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", mobile_no: "", email: "" });

  // Edit sheet state
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredStudents = students
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.mobile_no.includes(search) ||
          (s.email || "").toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const handleAdd = (e) => {
    e.preventDefault();
    addStudent.mutate(addForm, {
      onSuccess: () => {
        setAddOpen(false);
        setAddForm({ name: "", mobile_no: "", email: "" });
      },
    });
  };

  const openEdit = (student) => {
    setEditTarget({ ...student });
    setEditOpen(true);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    editStudent.mutate(
      { id: editTarget._id, name: editTarget.name, mobile_no: editTarget.mobile_no, email: editTarget.email, status: editTarget.status },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  const openDelete = (student) => {
    setDeleteTarget(student);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    deleteStudent.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  if (isError) return <ErrorOccured />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage all registered students on the platform.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-linear-to-b from-orange-400 to-red-500 text-white cursor-pointer rounded-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Student
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: students.length, icon: Users, color: "text-orange-500" },
          { label: "Active", value: students.filter((s) => s.status === "ACTIVE").length, icon: Shield, color: "text-green-500" },
          { label: "Blocked", value: students.filter((s) => s.status === "BLOCKED").length, icon: Shield, color: "text-red-500" },
          { label: "Unverified", value: students.filter((s) => s.status === "UNVERIFIED").length, icon: Shield, color: "text-yellow-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              {stat.label}
            </div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Table */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none p-0 focus-visible:ring-0 bg-transparent"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {s.mobile_no}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        {s.email || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => openEdit(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer text-destructive hover:bg-red-50" onClick={() => openDelete(s)}>
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

      {/* Add Student Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Create a new student account on the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input id="add-name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Enter full name" required className="rounded-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-mobile">Mobile Number *</Label>
              <Input id="add-mobile" value={addForm.mobile_no} onChange={(e) => setAddForm({ ...addForm, mobile_no: e.target.value })} placeholder="10-digit mobile number" required maxLength={10} className="rounded-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email (Optional)</Label>
              <Input id="add-email" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="email@example.com" className="rounded-sm" />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" className="rounded-sm" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addStudent.isPending} className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-sm cursor-pointer">
                {addStudent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Student</SheetTitle>
            <SheetDescription>Update student account information.</SheetDescription>
          </SheetHeader>
          {editTarget && (
            <form onSubmit={handleEdit} className="space-y-4 mt-6 px-1">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={editTarget.name} onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })} className="rounded-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile Number</Label>
                <Input value={editTarget.mobile_no} onChange={(e) => setEditTarget({ ...editTarget, mobile_no: e.target.value })} className="rounded-sm" maxLength={10} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editTarget.email || ""} onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })} className="rounded-sm" placeholder="email@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Account Status</Label>
                <select
                  value={editTarget.status}
                  onChange={(e) => setEditTarget({ ...editTarget, status: e.target.value })}
                  className="w-full border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <SheetFooter className="mt-6">
                <Button type="button" variant="outline" className="rounded-sm" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={editStudent.isPending} className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-sm cursor-pointer">
                  {editStudent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-sm cursor-pointer"
              disabled={deleteStudent.isPending}
              onClick={handleDelete}
            >
              {deleteStudent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsList;
