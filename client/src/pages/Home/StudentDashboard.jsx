import { purchaseApi } from "@/api/purchaseApi";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Flame,
  Play,
  Award,
  Check,
  Calendar,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useQueries } from "@tanstack/react-query";
import { progressApi } from "@/api/progressApi";
import { productivityApi } from "@/api/productivityApi";
import { apiClient } from "@/lib/axios";
import CertificateModal from "@/components/courses/CertificateModal";
import { useState } from "react";

const CourseCardFooter = ({ course, navigate }) => {
  const { data: progressData } = progressApi.useGetProgress(course._id);
  const progress = progressData?.progress_percentage ?? 0;
  const [isCertOpen, setIsCertOpen] = useState(false);

  return (
    <>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          onClick={() => navigate("/all-courses/" + course._id)}
          className={`cursor-pointer rounded-md text-xs h-8 ${
            progress === 100
              ? "w-1/2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "w-full bg-linear-to-b from-orange-400 to-red-500 text-white"
          }`}
        >
          {progress === 100 ? "Review" : "Continue"} <ArrowRight className="w-3 h-3 ml-1" />
        </Button>

        {progress === 100 && (
          <Button
            onClick={() => setIsCertOpen(true)}
            className="w-1/2 bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white cursor-pointer rounded-md text-xs h-8"
          >
            Certificate
          </Button>
        )}
      </div>

      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        courseTitle={course.title}
      />
    </>
  );
};

const getStreakCalendar = (currentStreak, lastActiveDate) => {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    let isActive = false;
    if (lastActiveDate) {
      const lastActive = new Date(lastActiveDate);
      if (dateStr === lastActiveDate) {
        isActive = true;
      } else if (new Date(dateStr) < lastActive) {
        const dayDiff = Math.round((lastActive - new Date(dateStr)) / (1000 * 60 * 60 * 24));
        if (dayDiff < currentStreak) {
          isActive = true;
        }
      }
    }

    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      date: dateStr,
      isActive,
      isToday: dateStr === today.toISOString().split("T")[0],
    });
  }
  return days;
};

const StudentDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { data: courses, isPending } = purchaseApi.useGetMyPurchasedCourses();
  const { data: videoProgress } = productivityApi.useGetVideoProgress();

  const progressQueries = useQueries({
    queries: (courses || []).map((c) => ({
      queryKey: ["course-progress", c._id],
      queryFn: async () => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.get(`/progress/${c._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
      enabled: !!c._id,
    })),
  });

  const enrolledCount = courses?.length ?? 0;
  const isProgressPending = progressQueries.some((q) => q.isPending);

  let inProgressCount = 0;
  let completedCount = 0;

  progressQueries.forEach((q) => {
    if (q.data) {
      const percentage = q.data.progress_percentage ?? 0;
      if (percentage === 100) {
        completedCount++;
      } else if (percentage > 0) {
        inProgressCount++;
      }
    }
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const streakDays = getStreakCalendar(user?.currentStreak || 0, user?.lastActiveDate);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-6 sm:p-8 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-orange-200 text-xs font-semibold tracking-wider uppercase">
            <LayoutDashboard className="w-4 h-4" />
            Student Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {greeting}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-orange-100 mt-2 text-xs sm:text-sm max-w-md leading-relaxed">
            Keep up the great work! You have{" "}
            <span className="font-extrabold text-white">
              {courses?.length ?? 0} course{courses?.length !== 1 ? "s" : ""}
            </span>{" "}
            enrolled. Let's unlock new milestones today.
          </p>
          <Button
            onClick={() => navigate("/all-courses")}
            variant="secondary"
            className="mt-3 border-none bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs h-9 px-4 cursor-pointer rounded-xl transition-all shadow-sm"
          >
            Explore More Courses <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-24 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Stats, Continue Watching, Courses) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Enrolled Courses",
                value: enrolledCount || "0",
                icon: BookOpen,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
              },
              {
                label: "In Progress",
                value: isPending || isProgressPending ? "0" : inProgressCount,
                icon: GraduationCap,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                label: "Completed",
                value: isPending || isProgressPending ? "0" : completedCount,
                icon: GraduationCap,
                color: "text-green-500",
                bg: "bg-green-500/10",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs hover:border-orange-500/30 hover:shadow-sm transition-all duration-300 flex items-center gap-4 group"
              >
                <div className={`p-3 rounded-xl ${s.bg} ${s.color} shrink-0`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground leading-none">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-semibold mt-1">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Watching Progress Queue */}
          {videoProgress && videoProgress.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-orange-500" />
                Continue Watching
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted animate-in fade-in duration-300">
                {videoProgress.map((item) => {
                  const percent = Math.round((item.playbackTime / item.duration) * 100);
                  const minLeft = Math.round((item.duration - item.playbackTime) / 60);

                  return (
                    <div
                      key={item._id}
                      onClick={() =>
                        navigate(
                          `/all-courses/${item.courseId._id}/contents?folder_id=${item.contentId.folder_id}&play=${item.contentId._id}`
                        )
                      }
                      className="bg-card border border-border/60 hover:border-orange-500/50 rounded-2xl p-3 min-w-[280px] w-72 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer shrink-0"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
                        {item.contentId?.thumbnail?.url ? (
                          <img
                            src={item.contentId.thumbnail.url}
                            alt={item.contentId.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-400/20 to-red-500/20 flex items-center justify-center">
                            <Play className="w-8 h-8 text-orange-500 fill-orange-500/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-3 bg-orange-500 text-white rounded-full shadow-lg">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                          {percent}% watched
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-orange-500 font-bold uppercase tracking-wider block truncate">
                          {item.courseId?.title}
                        </span>
                        <h3 className="font-extrabold text-sm text-foreground line-clamp-1 group-hover:text-orange-500 transition-colors">
                          {item.contentId?.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          {minLeft <= 0 ? "Less than a minute" : `${minLeft}m`} left
                        </p>
                      </div>

                      <div className="mt-3">
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Courses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">My Courses</h2>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-orange-500 hover:text-orange-600"
                onClick={() => navigate("/my-courses")}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {isPending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-card border rounded-xl h-52 animate-pulse"
                  />
                ))}
              </div>
            ) : !courses || courses.length === 0 ? (
              <div className="bg-card border rounded-xl p-12 text-center">
                <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  You haven't enrolled in any courses yet.
                </p>
                <Button
                  onClick={() => navigate("/all-courses")}
                  className="mt-4 bg-linear-to-b from-orange-400 to-red-500 text-white rounded-sm cursor-pointer"
                >
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {courses.slice(0, 6).map((c) => (
                  <div
                    key={c._id}
                    className="bg-card border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
                  >
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-orange-400 to-red-500">
                      {c.thumbnail?.url && (
                        <img
                          src={c.thumbnail.url}
                          alt={c.title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{c.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          Valid {c.validity} days
                        </span>
                        <span className="text-xs font-semibold text-orange-600">
                          ₹{c.offer_price}
                        </span>
                      </div>
                      <CourseCardFooter course={c} navigate={navigate} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Streak Activity & Achievements) */}
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs hover:border-orange-500/20 transition-all space-y-6">
            
            {/* Streak header */}
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500 animate-pulse">
                <Flame className="w-8 h-8 fill-orange-500/10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground">
                  {user?.currentStreak || 0} Day{user?.currentStreak !== 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Daily Learning Streak
                </p>
              </div>
            </div>

            {/* Streak Calendar Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                Streak Activity
              </span>
              <div className="flex justify-between items-center gap-1">
                {streakDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {day.label}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        day.isActive
                          ? "bg-gradient-to-b from-orange-400 to-red-500 text-white shadow-xs"
                          : day.isToday
                          ? "border border-dashed border-orange-500/60 text-orange-500"
                          : "bg-muted text-muted-foreground/60"
                      }`}
                      title={day.isActive ? "Active!" : "No activity"}
                    >
                      {day.isActive ? (
                        <Flame className="w-4 h-4 fill-white" />
                      ) : (
                        <span className="text-[10px] font-bold">
                          {new Date(day.date).getDate()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground text-center pt-2">
                Longest Streak: <span className="font-extrabold text-foreground">{user?.longestStreak || 0} days</span>
              </p>
            </div>

            {/* Streak Badges list */}
            <div className="space-y-4 pt-4 border-t">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                Streak Badges
              </span>
              <div className="space-y-3">
                {[
                  {
                    name: "Habit Builder",
                    requirement: "3 days streak",
                    xp: 50,
                    icon: Award,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                  },
                  {
                    name: "Dedicated Learner",
                    requirement: "7 days streak",
                    xp: 100,
                    icon: Award,
                    color: "text-orange-500",
                    bg: "bg-orange-500/10",
                  },
                  {
                    name: "Unstoppable",
                    requirement: "30 days streak",
                    xp: 500,
                    icon: Award,
                    color: "text-red-500",
                    bg: "bg-red-500/10",
                  },
                ].map((badge) => {
                  const isUnlocked = user?.badges?.includes(badge.name);

                  return (
                    <div
                      key={badge.name}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isUnlocked
                          ? "bg-card border-border/70 shadow-2xs"
                          : "bg-muted/30 border-dashed border-border/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${badge.bg} ${badge.color}`}>
                          <badge.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-foreground truncate">
                              {badge.name}
                            </span>
                            {isUnlocked ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground block font-medium">
                            {badge.requirement}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                        +{badge.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
