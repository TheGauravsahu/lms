import { useLocation, useNavigate, useParams } from "react-router";
import { courseApi } from "@/api/courseApi";
import LoadingScreen from "@/components/loading-screen";
import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Lock } from "lucide-react";
import FolderOptionsMenu from "@/components/admin/courses/folder/FolderOptionsMenu";
import CourseReviews from "@/components/courses/CourseReviews";
import { useAuthStore } from "@/store/auth";
import { purchaseApi } from "@/api/purchaseApi";
import { toast } from "sonner";

const CourseDetails = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const navigate = useNavigate();
  const { course_id } = useParams();
  const { data, isPending, isError } = courseApi.useGetCourseDetails(course_id);
  
  const token = useAuthStore((state) => state.token);
  const { data: isPurchased } = purchaseApi.useCheckPurchase(course_id);

  if (isPending) return <LoadingScreen />;
  if (isError) return <ErrorOccured />;

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Contents</h2>
          <div className="border-b-primary border-b-2 pb-1 font-[550] mt-6 w-32">
            <span className="flex items-center text-foreground">
              Content
              <div className="flex items-center justify-center ml-1 bg-secondary rounded-full text-xs p-1 h-5 w-5">
                {data.content.length}
              </div>
            </span>
          </div>
        </div>
        {isAdmin && (
          <Button
            className="cursor-pointer"
            onClick={() =>
              navigate(`/admin/courses/${course_id}/folders/new-folder`)
            }
          >
            <Plus /> New Folder
          </Button>
        )}
      </div>

      {/* content section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
        {data.content.map((c) => (
          <div
            key={c._id}
            className="bg-card dark:bg-muted/40 border rounded-lg p-3 flex justify-between items-center shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex gap-3 items-center min-w-0 flex-1">
              <div className="w-16 h-10 overflow-hidden rounded-md shrink-0 border bg-muted">
                <img
                  src={c.thumbnail.url}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold text-sm truncate text-foreground">{c.title}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isAdmin && (
                <FolderOptionsMenu courseId={course_id} folder={c} />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer rounded-full h-8 w-8 hover:bg-secondary"
                onClick={() => {
                  if (!isAdmin && !token) {
                    toast.error("Please login to access course content.");
                    return;
                  }
                  if (!isAdmin && !isPurchased) {
                    toast.error("Please purchase this course to access its content.");
                    return;
                  }
                  navigate(
                    isAdmin
                      ? `/admin/courses/${course_id}/folders/${c._id}`
                      : `/all-courses/${course_id}/folders/${c._id}`,
                  );
                }}
              >
                {!isAdmin && (!token || !isPurchased) ? (
                  <Lock className="w-4 h-4 text-muted-foreground/80" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </section>
      <CourseReviews courseId={course_id} />
    </div>
  );
};

export default CourseDetails;
