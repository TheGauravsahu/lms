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
        <section className="flex gap-8 items-start  py-4">
          {[1, 2, 3, 4].map((c) => (
            <div
              key={c}
              className="bg-gradient-to-l from-gray-200  h-18 border w-[30%] rounded-lg p-2 flex justify-between items-center"
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
          <div className="border-b-black border-b-2 pb-1 font-[550] mt-6 w-32">
            <span className="flex items-center">
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

      <section className="flex gap-8 items-start  py-4">
        {data.map((c) => (
          <div
            key={c._id}
            className="bg-gradient-to-l from-gray-200  h-18 border w-[30%] rounded-lg p-2 flex justify-between items-center"
          >
            <div className="flex gap-2 items-center">
              <div className="w-24 h-14 overflow-hidden rounded-sm">
                <img
                  src={c.thumbnail.url}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold">{c.title}</span>
            </div>

            <Button
              variant="ghost"
              className="cursor-pointer"
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
              <ChevronRight />
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default FolderDetails;
