import { useState } from "react";
import { productivityApi } from "@/api/productivityApi";
import { courseApi } from "@/api/courseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle2, Circle, AlertCircle, Bookmark, Loader2 } from "lucide-react";
import ErrorOccured from "@/components/error-occured";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/formatDate";

export const Calendar = () => {
  const { data: events = [], isPending, isError } = productivityApi.useGetCalendarEvents();
  const { data: coursesData } = courseApi.useGetAllCourses();
  
  const createMutation = productivityApi.useCreateCalendarEvent();
  const updateMutation = productivityApi.useUpdateCalendarEvent();
  const deleteMutation = productivityApi.useDeleteCalendarEvent();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "reminder",
    dueDate: "",
    courseId: "none",
  });

  const courses = Array.isArray(coursesData) ? coursesData : coursesData?.courses || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return;

    createMutation.mutate(
      {
        title: form.title,
        description: form.description,
        type: form.type,
        dueDate: new Date(form.dueDate).toISOString(),
        courseId: form.courseId === "none" ? null : form.courseId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ title: "", description: "", type: "reminder", dueDate: "", courseId: "none" });
        },
      }
    );
  };

  const handleToggleComplete = (event) => {
    updateMutation.mutate({
      id: event._id,
      isCompleted: !event.isCompleted,
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  if (isError) return <ErrorOccured />;

  // Filter completed and pending
  const pendingEvents = events.filter((e) => !e.isCompleted);
  const completedEvents = events.filter((e) => e.isCompleted);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-2">
              <CalendarIcon className="w-4 h-4" />
              Developer Planner
            </div>
            <h1 className="text-3xl font-extrabold">Productivity Calendar 🗓️</h1>
            <p className="text-orange-100 mt-2 max-w-md">
              Manage assignment deadlines, set learning reminders, and keep track of your schedule.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold rounded-xl py-2 px-4 shadow-sm shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Reminder
          </Button>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Reminders List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Reminders & Deadlines ({pendingEvents.length})
          </h2>

          {isPending ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card border rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          ) : pendingEvents.length === 0 ? (
            <EmptyState
              title="All caught up!"
              description="No pending reminders or assignment deadlines on your calendar."
              icon={CheckCircle2}
            />
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((event) => {
                const isDeadline = event.type === "deadline";
                const isEvent = event.type === "event";

                return (
                  <div
                    key={event._id}
                    className="bg-card border border-border/50 hover:border-orange-500/25 rounded-2xl p-5 flex items-start gap-4 shadow-xs transition-all group"
                  >
                    <button
                      onClick={() => handleToggleComplete(event)}
                      className="mt-0.5 text-muted-foreground hover:text-orange-500 transition-colors cursor-pointer shrink-0"
                    >
                      <Circle className="w-5 h-5" />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm text-foreground line-clamp-1">
                          {event.title}
                        </h3>
                        {isDeadline ? (
                          <span className="bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            Deadline
                          </span>
                        ) : isEvent ? (
                          <span className="bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            Event
                          </span>
                        ) : (
                          <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            Reminder
                          </span>
                        )}
                        {event.courseId && (
                          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[9px] font-bold truncate max-w-[120px]">
                            {event.courseId.title}
                          </span>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-orange-500" />
                        Due: {new Date(event.dueDate).toLocaleDateString()} at {new Date(event.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Checklist: Completed items */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Completed Task Log
          </h2>

          {isPending ? (
            <div className="bg-card border rounded-2xl h-48 animate-pulse" />
          ) : completedEvents.length === 0 ? (
            <div className="bg-card border border-dashed rounded-2xl p-6 text-center text-xs text-muted-foreground">
              Completed items will appear here for review.
            </div>
          ) : (
            <div className="bg-card border rounded-2xl p-4 divide-y divide-border/40 max-h-[350px] overflow-y-auto">
              {completedEvents.map((event) => (
                <div key={event._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(event)}
                      className="text-green-500 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-green-500/10" />
                    </button>
                    <span className="text-xs text-muted-foreground line-through truncate font-medium">
                      {event.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Reminder / Deadline</DialogTitle>
            <DialogDescription>Add a study reminder or assignment deadline to your calendar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rem-title">Title *</Label>
              <Input
                id="rem-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Study loops, Submit React Quiz..."
                required
                className="rounded-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rem-type">Type</Label>
                <select
                  id="rem-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="reminder">Reminder</option>
                  <option value="deadline">Deadline</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rem-course">Associated Course</Label>
                <select
                  id="rem-course"
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="none">None</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rem-due">Due Date & Time *</Label>
              <Input
                id="rem-due"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
                className="rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rem-desc">Description (Optional)</Label>
              <Textarea
                id="rem-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Take notes, review lectures beforehand..."
                className="rounded-sm"
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
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
