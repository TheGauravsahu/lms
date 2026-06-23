import { purchaseApi } from "@/api/purchaseApi";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useQueries } from "@tanstack/react-query";
import { progressApi } from "@/api/progressApi";
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

const StudentDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { data: courses, isPending } = purchaseApi.useGetMyPurchasedCourses();

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

      {/* My Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
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
  );
};

export default StudentDashboard;
