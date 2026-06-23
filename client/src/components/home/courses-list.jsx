import { courseApi } from "@/api/courseApi";
import ErrorOccured from "../error-occured";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useLocation, useNavigate } from "react-router";

const CoursesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const { isPending, isError, data } = courseApi.useGetAllCourses();

  if (isPending)
    return (
      <div className={`w-full${isHome && "pt-12"}`}>
        <h1
          className={`text-2xl font-semibold my-4 ${isHome && "text-center"}`}
        >
          Our Courses
        </h1>

        <div
          className={`flex items-center  flex-wrap gap-6 mt-6 ${isHome && "justify-center"}`}
        >
          {[1, 2, 3, 4].map((c) => (
            <Skeleton
              className={`rounded-sm h-70 ${isHome ? "w-64 " : "w-60"} overflow-hidden`}
              key={c}
            >
              <Skeleton className=" w-full h-[60%] rounded-t-sm" />

              <Skeleton className="h-4 w-8" />
              <Skeleton className="flex justify-between">
                <Skeleton className="h-4 w-8" />
                <Skeleton>
                  <Skeleton className="w-full my-3 cursor-pointer" />
                </Skeleton>
              </Skeleton>
            </Skeleton>
          ))}
        </div>
      </div>
    );
  if (isError) return <ErrorOccured />;

  return (
    <div className={`w-full${isHome && "pt-12"}`}>
      <h1 className={`text-2xl font-semibold my-4 ${isHome && "text-center"}`}>
        Our Courses
      </h1>

      <div
        className={`flex items-center  flex-wrap gap-6 mt-6 ${isHome && "justify-center"}`}
      >
        {data.map((c) => (
          <div
            className={`rounded-sm bg-linear-to-t from-gray-100 to-orange-600 dark:from-orange-800  border h-70 ${isHome ? "w-64 " : "w-60"} overflow-hidden`}
            key={c._id}
          >
            <div
              onClick={() => navigate("/all-courses/" + c._id)}
              className="overflow-hidden w-full h-[50%] rounded-t-sm cursor-pointer"
            >
              <img
                src={c.thumbnail.url}
                alt={c.title}
                className="object-cover scale-95 "
              />
            </div>

            <div className="p-2">
              <h2 className="font-semibold">{c.title}</h2>
              <div className="flex justify-between">
                <h3 className="font-semibold flex items-center gap-1">
                  ₹{c.offer_price}{" "}
                  <span className="line-through font-medium">
                    {c.original_price}
                  </span>
                </h3>

                <span className="bg-amber-400 text-white font-semibold  rounded-lg w-12 h-6 text-sm flex items-center justify-center">
                  New
                </span>
              </div>
              <Button
                onClick={() => navigate("/all-courses/" + c._id)}
                className="w-full my-3 cursor-pointer"
              >
                Explore <ArrowRight />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
