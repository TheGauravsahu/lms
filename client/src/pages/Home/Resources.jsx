import { productivityApi } from "@/api/productivityApi";
import { DownloadCloud, FileText, Calendar, BookOpen, ExternalLink } from "lucide-react";
import ErrorOccured from "@/components/error-occured";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/formatDate";

export const Resources = () => {
  const { data: resources = [], isPending, isError } = productivityApi.useGetDownloadableResources();

  if (isError) return <ErrorOccured />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-2">
            <DownloadCloud className="w-4 h-4" />
            Central Repository
          </div>
          <h1 className="text-3xl font-extrabold">Downloadable Resources 📥</h1>
          <p className="text-orange-100 mt-2 max-w-md">
            Access and download handouts, source code files, cheatsheets, and PDF study guides from your courses.
          </p>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Main List */}
      <div>
        {isPending ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            title="No Resources Available"
            description="We couldn't find any PDF materials in your purchased courses yet."
            icon={DownloadCloud}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((res) => {
              const fileUrl = res.content?.url;
              const courseTitle = res.folder_id?.course_id?.title || "Course Material";
              const folderTitle = res.folder_id?.title || "Notes";

              return (
                <div
                  key={res._id}
                  className="bg-card border border-border/50 hover:border-orange-500/25 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        PDF Handout
                      </span>
                      <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-semibold">
                        <Calendar className="w-3 h-3 text-orange-500" />
                        {formatDate(res.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-foreground line-clamp-1 leading-snug">
                          {res.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1 font-semibold">
                          <BookOpen className="w-3 h-3 text-orange-500" />
                          <span>{courseTitle}</span>
                          <span>•</span>
                          <span>{folderTitle}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">
                      Resource Guide
                    </span>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-secondary text-secondary-foreground hover:bg-orange-500 hover:text-white transition-all text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs border border-border/60 hover:border-orange-500"
                    >
                      Download <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
