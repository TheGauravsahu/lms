import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { purchaseApi } from "@/api/purchaseApi";

const MyCourse = () => {
  const navigate = useNavigate();
  const { isPending, isError, data } = purchaseApi.useGetMyPurchasedCourses();

  if (isPending)
    return (
      <div className="w-full">
        <h1 className="text-2xl font-semibold my-4">Our Courses</h1>

        <div className={`flex items-center  flex-wrap gap-6 mt-6`}>
          {[1, 2, 3, 4].map((c) => (
            <Skeleton className="rounded-sm h-70  w-60 overflow-hidden" key={c}>
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
    <div className={`w-full`}>
      <h1 className={`text-2xl font-semibold my-4`}>Our Courses</h1>

      <div className={`flex items-center  flex-wrap gap-6 mt-6`}>
        {data.map((c) => (
          <div
            className={`rounded-sm bg-linear-to-t from-gray-100 to-orange-600  border h-70  w-60 overflow-hidden`}
            key={c._id}
          >
            <div
              onClick={() => navigate("/all-courses/" + c._id)}
              className="overflow-hidden w-full h-[60%] rounded-t-sm cursor-pointer"
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
                Go to Course <ArrowRight />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourse;
