import { courseApi } from "@/api/courseApi";
import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";

const ContentDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parent = searchParams.get("parent");
  const folder_id = searchParams.get("folder_id");

  const { course_id } = useParams();
  const { data, isPending, isError } =
    courseApi.useGetAllCourseContents(folder_id);

  if (isError) return <ErrorOccured />;
  if (isPending)
    return (
      <div>
        <section className="flex gap-8 items-start  py-4">
          {[1, 2, 3, 4].map((c) => (
            <div
              key={c}
              className="bg-linear-to-l from-gray-200  h-18 border w-[30%] rounded-lg p-2 flex justify-between items-center"
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
          <h2 className="font-semibold text-2xl">{parent}</h2>
          <div className="border-b-black border-b-2 pb-1 font-[550] mt-6 w-32">
            <span className="flex items-center">
              {parent}
              <div className="flex items-center justify-center ml-1 bg-secondary rounded-full text-xs p-1 h-5 w-5">
                {data.length}
              </div>
            </span>
          </div>
        </div>
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
                  src={c.thumbnail ? c.thumbnail.url: "/course_banner_bg.png"}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold">{c.title}</span>
            </div>

            <Button variant="ghost" className="cursor-pointer">
              <a href={c.content.url || ""} target="_blank">
                <ChevronRight />
              </a>
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ContentDetails;
