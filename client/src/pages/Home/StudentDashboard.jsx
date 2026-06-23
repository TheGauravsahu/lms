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

const StudentDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { data: courses, isPending } = purchaseApi.useGetMyPurchasedCourses();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-2">
            <LayoutDashboard className="w-4 h-4" />
            Student Dashboard
          </div>
          <h1 className="text-3xl font-extrabold">
            {greeting}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-orange-100 mt-2 max-w-md">
            Keep up the great work! You have{" "}
            <span className="font-bold text-white">
              {courses?.length ?? 0} course{courses?.length !== 1 ? "s" : ""}
            </span>{" "}
            enrolled. Let's keep learning.
          </p>
          <Button
            onClick={() => navigate("/all-courses")}
            variant="secondary"
            className="mt-5 border-white   cursor-pointer rounded-sm"
          >
            Explore More Courses <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-24 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: "Enrolled Courses",
            value: courses?.length ?? "—",
            icon: BookOpen,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-950/30",
          },
          {
            label: "In Progress",
            value: courses?.length ?? "—",
            icon: GraduationCap,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            label: "Completed",
            value: 0,
            icon: GraduationCap,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-950/30",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border rounded-xl p-5 shadow-xs"
          >
            <div className={`p-2.5 rounded-lg ${s.bg} w-fit`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="mt-3 text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {s.label}
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
                  {/* Progress bar placeholder */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>0%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-orange-400 to-red-500 rounded-full"
                        style={{ width: "0%" }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate("/all-courses/" + c._id)}
                    className="w-full mt-3 cursor-pointer rounded-sm bg-linear-to-b from-orange-400 to-red-500 text-white text-sm"
                  >
                    Continue Learning{" "}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
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
