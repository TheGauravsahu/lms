import { useLocation, useNavigate, useParams } from "react-router";
import { courseApi } from "@/api/courseApi";
import LoadingScreen from "@/components/loading-screen";
import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChevronRight } from "lucide-react";

const CourseDetails = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const navigate = useNavigate();
  const { course_id } = useParams();
  const { data, isPending, isError } = courseApi.useGetCourseDetails(course_id);

  if (isPending) return <LoadingScreen />;
  if (isError) return <ErrorOccured />;

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Contents</h2>
          <div className="border-b-black border-b-2 pb-1 font-[550] mt-6 w-32">
            <span className="flex items-center">
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
      <section className="flex gap-8 items-start  py-4">
        {data.content.map((c) => (
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
                navigate(
                  isAdmin
                    ? `/admin/courses/${course_id}/folders/${c._id}`
                    : `/all-courses/${course_id}/folders/${c._id}`,
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

export default CourseDetails;
