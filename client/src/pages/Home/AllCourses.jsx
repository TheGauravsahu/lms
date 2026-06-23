import { useState, useEffect } from "react";
import { courseApi } from "@/api/courseApi";
import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Clock, Layers, Flame, Award, Sparkles } from "lucide-react";
import EmptyState from "@/components/empty-state";
import { useNavigate } from "react-router";

export const AllCourses = () => {
  const navigate = useNavigate();

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Debounce search query to prevent excessive backend hits
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { isPending, isError, data } = courseApi.useGetAllCourses({
    page,
    limit,
    search: debouncedSearch,
    filter: activeFilter,
  });

  const courses = data?.courses || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isError) return <ErrorOccured />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-2">
            <BookOpen className="w-4 h-4" />
            LMS Library
          </div>
          <h1 className="text-3xl font-extrabold">All Courses 📚</h1>
          <p className="text-orange-100 mt-2 max-w-md">
            Unlock your potential by exploring our interactive courses curated for modern developers.
          </p>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-24 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Search and Filters bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border/40 p-4 rounded-2xl shadow-xs">
        {/* Search Input wrapper */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title..."
            className="pl-10 h-10 bg-background border-border/80 text-foreground text-xs rounded-xl focus:border-orange-500/80 w-full"
          />
        </div>

        {/* Filter chips list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          {[
            { id: "all", label: "All Courses", icon: BookOpen },
            { id: "trending", label: "Trending", icon: Flame },
            { id: "new", label: "New", icon: Sparkles },
            { id: "featured", label: "Featured", icon: Award },
          ].map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/10"
                    : "bg-background border-border/60 hover:border-orange-500/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <filter.icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid container */}
      <div>
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card border border-border/40 rounded-2xl h-80 animate-pulse"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No Matching Courses"
            description="We couldn't find any courses matching your search query or filter parameters. Try another name or keyword!"
            icon={BookOpen}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((c) => {
              const showBadge = c.is_trending || c.is_featured || c.is_new;
              const badgeText = c.is_trending ? "Trending" : c.is_featured ? "Featured" : "New";

              return (
                <div
                  key={c._id}
                  className="bg-card border border-border/50 hover:border-orange-500/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Image Header */}
                  <div
                    onClick={() => navigate("/all-courses/" + c._id)}
                    className="overflow-hidden w-full h-36 bg-muted cursor-pointer relative"
                  >
                    <img
                      src={c.thumbnail?.url || "/course_banner_bg.png"}
                      alt={c.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {showBadge && (
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase border border-white/10 flex items-center gap-1">
                        {c.is_trending && <Flame className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />}
                        {badgeText}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3
                        onClick={() => navigate("/all-courses/" + c._id)}
                        className="font-extrabold text-sm text-foreground leading-snug cursor-pointer group-hover:text-orange-500 transition-colors line-clamp-1"
                        title={c.title}
                      >
                        {c.title}
                      </h3>
                      
                      {/* Meta information row */}
                      <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {c.validity} Days Access
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-orange-500" />
                          Syllabus
                        </span>
                      </div>
                    </div>

                    {/* Price and Button Row */}
                    <div className="border-t border-border/50 pt-3 flex flex-col gap-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-foreground">₹{c.offer_price}</span>
                        {c.original_price && (
                          <span className="line-through text-[10px] font-semibold text-muted-foreground">
                            ₹{c.original_price}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => navigate("/all-courses/" + c._id)}
                        className="w-full bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-extrabold rounded-xl py-1.5 text-xs h-8.5 transition-all shadow-xs"
                      >
                        Explore
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl px-4 cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-xs font-semibold text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl px-4 cursor-pointer"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
