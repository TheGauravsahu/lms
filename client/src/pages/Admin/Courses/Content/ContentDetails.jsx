import { useState } from "react";
import { courseApi } from "@/api/courseApi";
import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, X, CheckCircle2, Circle, FileText } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import ContentOptionsMenu from "@/components/admin/courses/content/content-options-menu";
import CustomVideoPlayer from "@/components/courses/CustomVideoPlayer";
import PdfViewerDialog from "@/components/courses/PdfViewerDialog";
import { progressApi } from "@/api/progressApi";
import ContentComments from "@/components/courses/ContentComments";
import EmptyState from "@/components/empty-state";
import CertificateModal from "@/components/courses/CertificateModal";

const ContentDetails = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parent = searchParams.get("parent");
  const folder_id = searchParams.get("folder_id");

  const [activeVideo, setActiveVideo] = useState(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const { course_id } = useParams();
  
  // Progress Query & Mutation
  const { data: progressData } = progressApi.useGetProgress(!isAdmin ? course_id : null);
  const { data: courseDetails } = courseApi.useGetCourseDetails(course_id);
  const courseTitle = courseDetails?.overview?.title || "This Course";
  const toggleProgressMutation = progressApi.useToggleProgress();

  const { data, isPending, isError } =
    courseApi.useGetAllCourseContents(folder_id);

  if (isError) return <ErrorOccured />;
  if (isPending)
    return (
      <div>
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
          {[1, 2, 3, 4].map((c) => (
            <div
              key={c}
              className="bg-card dark:bg-muted/40 h-18 border rounded-lg p-3 animate-pulse"
            />
          ))}
        </section>
      </div>
    );

  const completedSet = new Set(progressData?.completed_contents || []);

  const handleToggleComplete = (contentId) => {
    if (toggleProgressMutation.isPending) return;
    toggleProgressMutation.mutate({
      course_id,
      content_id: contentId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar for Students */}
      {!isAdmin && progressData && (
        <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground">Course Completion Progress</span>
            <span className="text-orange-500">{progressData.progress_percentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${progressData.progress_percentage}%` }}
            />
          </div>
          {progressData.progress_percentage === 100 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-muted/50 mt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-green-500 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Congratulations! You have completed the course!</span>
              </div>
              <Button
                onClick={() => setIsCertificateOpen(true)}
                className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold text-sm cursor-pointer rounded-md h-8 py-0 px-3"
              >
                Claim Certificate
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Video Player Section */}
      {activeVideo && (
        <div className="bg-card border rounded-xl p-4 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base md:text-lg text-foreground truncate max-w-[80%]">
              Now Playing: {activeVideo.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveVideo(null)}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CustomVideoPlayer url={activeVideo.url} title={activeVideo.title} />
          
          {/* Discussion comments underneath video player */}
          <ContentComments contentId={activeVideo.id} />
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl text-foreground">{parent}</h2>
          <div className="border-b-primary border-b-2 pb-1 font-[550] mt-6 w-32">
            <span className="flex items-center text-foreground">
              {parent}
              <div className="flex items-center justify-center ml-1 bg-secondary rounded-full text-xs p-1 h-5 w-5">
                {data.length}
              </div>
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                navigate(
                  `/admin/courses/${course_id}/folders/new-folder?parent_id=${folder_id}`,
                )
              }
            >
              <Plus /> New Folder
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() =>
                navigate(
                  `/admin/courses/${course_id}/contents/new-content?folder_id=${folder_id}`,
                )
              }
            >
              <Plus /> New {parent}
            </Button>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyState
          title={`No ${parent || "Content"} Available`}
          description={isAdmin ? "Create subfolders or upload files to populate this section." : "No learning materials have been posted in this section yet."}
          icon={FileText}
          actionLabel={isAdmin ? `Add New ${parent || "Content"}` : null}
          onAction={isAdmin ? () => navigate(`/admin/courses/${course_id}/contents/new-content?folder_id=${folder_id}`) : null}
        />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
          {data.map((c) => {
            const isVideo = c.content_type === "VIDEO";
            const isPdf = c.content_type === "PDF";
            const isCompleted = completedSet.has(c._id);

            const cardContent = (
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-3 items-center min-w-0 flex-1">
                  {/* Complete checkbox trigger for students */}
                  {!isAdmin && (
                    <button
                      onClick={() => handleToggleComplete(c._id)}
                      className="cursor-pointer text-muted-foreground hover:text-green-500 transition-colors shrink-0"
                      title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50/10" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  
                  <div className="w-16 h-10 overflow-hidden rounded-md shrink-0 border bg-muted">
                    <img
                      src={
                        c.thumbnail
                          ? c.thumbnail.url
                          : "/course_banner_bg.png"
                      }
                      alt={c.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`font-semibold text-sm truncate block text-foreground ${isCompleted && !isAdmin ? "line-through text-muted-foreground" : ""}`}>
                      {c.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
                      {c.content_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isAdmin && (
                    <ContentOptionsMenu prevContent={c} />
                  )}
                  {isPdf ? (
                    <PdfViewerDialog pdfUrl={c.content.url} title={c.title}>
                      <Button variant="ghost" size="icon" className="cursor-pointer rounded-full h-8 w-8 hover:bg-secondary">
                        <ChevronRight className="w-4 h-4 text-orange-500" />
                      </Button>
                    </PdfViewerDialog>
                  ) : isVideo ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`cursor-pointer rounded-full h-8 w-8 hover:bg-secondary ${
                        activeVideo?.url === c.content.url ? "text-orange-500 bg-secondary" : ""
                      }`}
                      onClick={() => {
                        setActiveVideo({ url: c.content.url, title: c.title, id: c._id });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="cursor-pointer rounded-full h-8 w-8 hover:bg-secondary" asChild>
                      <a href={c.content.url || ""} target="_blank" rel="noopener noreferrer">
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={c._id}
                className={`bg-card dark:bg-muted/40 border rounded-lg p-3 shadow-2xs hover:shadow-xs transition-all ${
                  activeVideo?.url === c.content.url ? "border-orange-500 ring-1 ring-orange-500/50" : ""
                } ${isCompleted && !isAdmin ? "opacity-90 border-green-500/30 bg-green-500/2 dark:bg-green-500/1" : ""}`}
              >
                {cardContent}
              </div>
            );
          })}
        </section>
      )}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        courseTitle={courseTitle}
      />
    </div>
  );
};

export default ContentDetails;
