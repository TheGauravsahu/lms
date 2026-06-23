import { useState, useEffect } from "react";
import { searchApi } from "@/api/searchApi";
import { Search, Video, FileText, Brain, MessageSquare, ChevronRight, HelpCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ErrorOccured from "@/components/error-occured";
import EmptyState from "@/components/empty-state";
import { useNavigate } from "react-router";

export const GlobalSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  const { data, isPending, isError } = searchApi.useGlobalSearch(searchTerm);

  const lessons = data?.lessons || [];
  const quizzes = data?.quizzes || [];
  const forums = data?.forums || [];

  const totalResults = lessons.length + quizzes.length + forums.length;

  if (isError) return <ErrorOccured />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Search Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-1">
              <Search className="w-4 h-4" />
              Unified Lookup
            </div>
            <h1 className="text-3xl font-extrabold">Global Knowledge Search 🔍</h1>
            <p className="text-orange-100 mt-1 max-w-md text-xs">
              Search instantly across all lesson materials, quizzes, and community forum discussions.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type keywords (e.g. state, variable, component)..."
              className="pl-10 h-11 bg-white border-0 text-black text-sm rounded-xl focus-visible:ring-2 focus-visible:ring-orange-300 w-full"
            />
          </div>
        </div>
      </div>

      {/* Tabs list */}
      {searchTerm && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-1.5 border-b border-border/40 pb-px overflow-x-auto">
            {[
              { id: "all", label: `All Results (${totalResults})` },
              { id: "lessons", label: `Lessons (${lessons.length})` },
              { id: "quizzes", label: `Quizzes (${quizzes.length})` },
              { id: "forums", label: `Forum Threads (${forums.length})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Results container */}
          <div>
            {isPending ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-card border rounded-2xl h-20 animate-pulse" />
                ))}
              </div>
            ) : totalResults === 0 ? (
              <EmptyState
                title="No results found"
                description={`We couldn't find any lessons, quizzes, or forum threads matching "${searchTerm}".`}
                icon={Search}
              />
            ) : (
              <div className="space-y-6">
                {/* 1. Lessons */}
                {(activeTab === "all" || activeTab === "lessons") && lessons.length > 0 && (
                  <div className="space-y-3">
                    {activeTab === "all" && <h2 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Lessons ({lessons.length})</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lessons.map((lesson) => (
                        <div
                          key={lesson._id}
                          onClick={() => navigate(`/all-courses/${lesson.folder_id?.course_id?._id || ""}`)}
                          className="bg-card border border-border/50 hover:border-orange-500/25 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-orange-500/10 text-orange-600 rounded-lg shrink-0">
                              {lesson.content_type === "VIDEO" ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-xs text-foreground group-hover:text-orange-500 transition-colors truncate">
                                {lesson.title}
                              </h3>
                              <p className="text-[10px] text-muted-foreground truncate">
                                Course: {lesson.folder_id?.course_id?.title || "Overview"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Quizzes */}
                {(activeTab === "all" || activeTab === "quizzes") && quizzes.length > 0 && (
                  <div className="space-y-3">
                    {activeTab === "all" && <h2 className="text-xs font-black uppercase text-muted-foreground tracking-wider mt-4">Quizzes ({quizzes.length})</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz._id}
                          onClick={() => navigate(`/quizzes`)}
                          className="bg-card border border-border/50 hover:border-orange-500/25 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg shrink-0">
                              <Brain className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-xs text-foreground group-hover:text-orange-500 transition-colors truncate">
                                {quiz.title}
                              </h3>
                              <p className="text-[10px] text-muted-foreground font-semibold">
                                {quiz.questions?.length || 0} Questions Assessment
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Forums */}
                {(activeTab === "all" || activeTab === "forums") && forums.length > 0 && (
                  <div className="space-y-3">
                    {activeTab === "all" && <h2 className="text-xs font-black uppercase text-muted-foreground tracking-wider mt-4">Forums ({forums.length})</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {forums.map((post) => (
                        <div
                          key={post._id}
                          onClick={() => navigate(`/forums/${post._id}`)}
                          className="bg-card border border-border/50 hover:border-orange-500/25 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-green-500/10 text-green-600 rounded-lg shrink-0">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-xs text-foreground group-hover:text-orange-500 transition-colors truncate">
                                {post.title}
                              </h3>
                              <p className="text-[10px] text-muted-foreground truncate">
                                Posted by: {post.authorId?.name || "Community Member"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!searchTerm && (
        <EmptyState
          title="Search anything"
          description="Type in the search bar above to query courses, lessons, quizzes, or forum threads instantly."
          icon={Search}
        />
      )}
    </div>
  );
};

export default GlobalSearch;
