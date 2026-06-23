import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { purchaseApi } from "@/api/purchaseApi";
import EmptyState from "@/components/empty-state";

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

  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-semibold my-4">Our Courses</h1>
        <EmptyState
          title="No Enrolled Courses"
          description="You haven't enrolled in any courses yet. Browse our catalog to find the perfect one for you!"
          icon={GraduationCap}
          actionLabel="Browse Courses"
          onAction={() => navigate("/all-courses")}
        />
      </div>
    );
  }

  return (
    <div className={`w-full`}>
      <h1 className={`text-2xl font-semibold my-4`}>Our Courses</h1>

      <div className="flex items-center flex-wrap gap-6 mt-6">
        {data.map((c) => (
          <div
            className="rounded-xl bg-card border border-border/60 hover:border-orange-500/50 h-80 w-60 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            key={c._id}
          >
            <div
              onClick={() => navigate("/all-courses/" + c._id)}
              className="overflow-hidden w-full h-[48%] bg-muted cursor-pointer"
            >
              <img
                src={c.thumbnail?.url}
                alt={c.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-sm text-foreground truncate group-hover:text-orange-500 transition-colors" title={c.title}>
                  {c.title}
                </h2>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-1 text-sm text-foreground">
                    ₹{c.offer_price}{" "}
                    {c.original_price && (
                      <span className="line-through font-medium text-[10px] text-muted-foreground">
                        ₹{c.original_price}
                      </span>
                    )}
                  </h3>

                  <span className="bg-orange-500/10 text-orange-500 dark:text-orange-400 font-semibold rounded-md px-1.5 py-0.5 text-[10px] flex items-center justify-center">
                    New
                  </span>
                </div>
              </div>
              <Button
                onClick={() => navigate("/all-courses/" + c._id)}
                className="w-full mt-2 cursor-pointer bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-medium rounded-md py-1.5 text-xs h-8"
              >
                Go to Course <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourse;
