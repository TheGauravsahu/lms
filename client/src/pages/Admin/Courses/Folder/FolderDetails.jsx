import { courseApi } from "@/api/courseApi";
import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";

const FolderDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const { course_id, folder_id } = useParams();
  const { data, isPending, isError } = courseApi.useAllCourseFolders(
    course_id,
    folder_id,
  );

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

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Folders</h2>
          <div className="border-b-primary border-b-2 pb-1 font-[550] mt-6 w-32">
            <span className="flex items-center text-foreground">
              Folder
              <div className="flex items-center justify-center ml-1 bg-secondary rounded-full text-xs p-1 h-5 w-5">
                {data.length}
              </div>
            </span>
          </div>
        </div>
        {isAdmin && (
          <Button
            className="cursor-pointer"
            onClick={() =>
              navigate(
                `/admin/courses/${course_id}/folders/new-folder?parent_id=${folder_id}`,
              )
            }
          >
            <Plus /> New Folder
          </Button>
        )}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
        {data.map((c) => (
          <div
            key={c._id}
            className="bg-card dark:bg-muted/40 border rounded-lg p-3 flex justify-between items-center shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex gap-3 items-center min-w-0">
              <div className="w-16 h-10 overflow-hidden rounded-md shrink-0">
                <img
                  src={c.thumbnail.url}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold text-sm truncate text-foreground">{c.title}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer shrink-0 rounded-full h-8 w-8 hover:bg-secondary"
              onClick={() =>
                isAdmin
                  ? data.parent_id === null
                    ? navigate(`/admin/courses/${course_id}/folders/${c._id}`)
                    : navigate(
                        `/admin/courses/${course_id}/contents?folder_id=${c._id}&parent=${c.title}`,
                      )
                  : data.parent_id === null
                    ? navigate(`/all-courses/${course_id}/folders/${c._id}`)
                    : navigate(
                        `/all-courses/${course_id}/contents?folder_id=${c._id}&parent=${c.title}`,
                      )
              }
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default FolderDetails;
