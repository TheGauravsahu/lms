import { courseApi } from "@/api/courseApi";
import ErrorOccured from "../error-occured";
import { Button } from "../ui/button";
import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useNavigate } from "react-router";
import EmptyState from "@/components/empty-state";

export const CoursesList = () => {
  const navigate = useNavigate();
  const { isPending, isError, data } = courseApi.useGetAllCourses();

  if (isPending) {
    return (
      <div className="w-full">
        <div className="flex items-end justify-between mb-8 border-b border-border/40 pb-4 animate-pulse">
          <div>
            <div className="h-6 w-48 bg-muted rounded-md" />
            <div className="h-3 w-64 bg-muted rounded-md mt-2" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border/40 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) return <ErrorOccured />;

  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-end justify-between mb-8 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Featured Courses</h2>
          </div>
        </div>
        <EmptyState
          title="No Courses Available"
          description="We are preparing new learning content for you. Check back soon!"
          icon={BookOpen}
        />
      </div>
    );
  }

  // Display a curated set of the first 3 courses on the home page
  const featuredCourses = data.slice(0, 3);

  return (
    <div className="w-full">
      {/* Curved Header Section */}
      <div className="flex items-end justify-between mb-8 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Featured Courses</h2>
          <p className="text-xs text-muted-foreground mt-1">Accelerate your developer journey with our top courses.</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/all-courses")}
          className="text-orange-500 hover:text-orange-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-orange-500/5 transition-colors shrink-0"
        >
          View All Courses <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredCourses.map((c) => (
          <div
            key={c._id}
            className="bg-card border border-border/50 hover:border-orange-500/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Image banner */}
            <div
              onClick={() => navigate("/all-courses/" + c._id)}
              className="overflow-hidden w-full h-44 bg-muted cursor-pointer relative"
            >
              <img
                src={c.thumbnail?.url || "/course_banner_bg.png"}
                alt={c.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border border-white/10">
                Popular
              </div>
            </div>

            {/* Info details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3
                  onClick={() => navigate("/all-courses/" + c._id)}
                  className="font-extrabold text-base text-foreground leading-snug cursor-pointer group-hover:text-orange-500 transition-colors line-clamp-1"
                  title={c.title}
                >
                  {c.title}
                </h3>
                
                {/* Meta Row */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    {c.validity} Days Access
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-500" />
                    Full Syllabus
                  </span>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Price</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-foreground">₹{c.offer_price}</span>
                    {c.original_price && (
                      <span className="line-through text-xs font-semibold text-muted-foreground">
                        ₹{c.original_price}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/all-courses/" + c._id)}
                  className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-extrabold rounded-xl py-2 px-4 text-xs h-9 transition-all shadow-xs"
                >
                  Explore Course
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
