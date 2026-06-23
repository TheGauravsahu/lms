import { announcementApi } from "@/api/announcementApi";
import { Megaphone, Calendar, BookOpen, AlertCircle } from "lucide-react";
import ErrorOccured from "@/components/error-occured";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/formatDate";

export const Announcements = () => {
  const { data: announcements = [], isPending, isError } = announcementApi.useGetAnnouncements();

  if (isError) return <ErrorOccured />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-2">
            <Megaphone className="w-4 h-4" />
            Platform Updates
          </div>
          <h1 className="text-3xl font-extrabold">Announcements 📢</h1>
          <p className="text-orange-100 mt-2 max-w-md">
            Stay up to date with course materials release, deadlines, and direct updates from instructors.
          </p>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-24 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Main List */}
      <div>
        {isPending ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border/40 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No Announcements"
            description="Instructors haven't posted any updates yet. Check back later!"
            icon={Megaphone}
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="bg-card border border-border/50 hover:border-orange-500/30 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  {/* Badge */}
                  {ann.courseId ? (
                    <div className="bg-orange-500/10 text-orange-600 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {ann.courseId.title}
                    </div>
                  ) : (
                    <div className="bg-green-500/10 text-green-600 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Global Update
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(ann.createdAt)}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-foreground mb-2">{ann.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {ann.body}
                </p>

                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Sent by:</span>
                  <span>{ann.createdBy?.name || "Instructor"} ({ann.createdBy?.email})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
