import { productivityApi } from "@/api/productivityApi";
import { Bookmark, Play, Trash2, Video, Calendar, ArrowRight } from "lucide-react";
import ErrorOccured from "@/components/error-occured";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { formatDate } from "@/lib/formatDate";

export const WatchLater = () => {
  const navigate = useNavigate();
  const { data: watchLaterList = [], isPending, isError } = productivityApi.useGetWatchLater();
  const removeMutation = productivityApi.useRemoveWatchLater();

  const handleRemove = (e, contentId) => {
    e.stopPropagation();
    removeMutation.mutate(contentId);
  };

  if (isError) return <ErrorOccured />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-2">
            <Bookmark className="w-4 h-4 fill-orange-200" />
            Watch Queue
          </div>
          <h1 className="text-3xl font-extrabold">Watch Later 🍿</h1>
          <p className="text-orange-100 mt-2 max-w-md">
            Save lesson videos you want to review or catch up on later in one convenient playlist.
          </p>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Watch Later Queue */}
      <div>
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border rounded-2xl h-60 animate-pulse" />
            ))}
          </div>
        ) : watchLaterList.length === 0 ? (
          <EmptyState
            title="Your queue is empty"
            description="Add lesson videos to your watch later queue from any course contents page."
            icon={Bookmark}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchLaterList.map((item) => {
              const content = item.contentId;
              if (!content) return null;

              return (
                <div
                  key={item._id}
                  className="bg-card border border-border/50 hover:border-orange-500/35 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Thumbnail / Header */}
                  <div className="relative w-full h-36 bg-muted overflow-hidden shrink-0">
                    <img
                      src={content.thumbnail?.url || "/course_banner_bg.png"}
                      alt={content.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase border border-white/10 flex items-center gap-1">
                      <Video className="w-2.5 h-2.5 text-orange-400" />
                      Video
                    </div>
                    <button
                      onClick={(e) => handleRemove(e, content._id)}
                      className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-red-500/80 backdrop-blur-xs text-white p-1.5 rounded-full border border-white/10 transition-colors cursor-pointer"
                      title="Remove from Watch Later"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-sm text-foreground line-clamp-1 group-hover:text-orange-500 transition-colors" title={content.title}>
                        {content.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                        <Calendar className="w-3 h-3 text-orange-500" />
                        Saved: {formatDate(item.createdAt)}
                      </div>
                    </div>

                    {/* Action button */}
                    <Button
                      onClick={() => navigate(`/all-courses/folders/contents?content_id=${content._id}`)} // Redirect to content viewer or all-courses detail page. Wait, let's redirect directly to the all courses page.
                      className="w-full bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-extrabold rounded-xl py-1.5 text-xs h-8.5 transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      Watch Lesson <Play className="w-3 h-3 fill-white" />
                    </Button>
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

export default WatchLater;
