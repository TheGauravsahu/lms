import LoginModal from "@/components/auth/login-modal";
import UserDropdown from "@/components/auth/user-dropdown";
import CommandMenu from "@/components/home/command-menu";
import CoursesList from "@/components/home/courses-list";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

import { useNavigate } from "react-router";

const HomePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <header className="bg-background p-4 px-4 sm:px-12 border-b sticky top-0 right-0 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-8 overflow-hidden">
              <img src="/icon.png" alt="lms_icon" className="w-full h-full" />
            </div>
            <h1 className="tracking-tight font-semibold t">
              Gaurav <span className="text-muted-foreground">LMS</span>
            </h1>
          </div>

          <div className="hidden sm:block">
            <CommandMenu />
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <h2
            onClick={() => navigate("/all-courses")}
            className="text-sm cursor-pointer hover:text-orange-500 transition-colors"
          >
            Courses
          </h2>

          {user && user.role === "ADMIN" && (
            <h2
              onClick={() => navigate("/admin")}
              className="text-sm cursor-pointer font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Admin Panel
            </h2>
          )}

          <ThemeToggle />

          {user ? (
            <UserDropdown user={user} />
          ) : (
            <LoginModal>
              <Button className="bg-linear-to-b from-orange-300 to-red-500 cursor-pointer rounded-sm">
                Login/Register
              </Button>
            </LoginModal>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden w-[95%] max-w-7xl mx-auto rounded-3xl mt-8 bg-card border border-border/40 shadow-xl p-8 sm:p-12 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 group">
        
        {/* Glow ambient background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-orange-500/15 transition-all duration-700" />

        {/* Hero Left Content */}
        <div className="relative z-10 flex flex-col justify-center max-w-2xl text-left space-y-6">
          {/* Badge */}
          <div className="w-fit px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400 text-xs font-semibold tracking-wider uppercase animate-pulse">
            ⚡ Empowering 100k+ Developers Worldwide
          </div>

          <h1 className="text-foreground font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight">
            Learn Coding. <br />
            The <span className="bg-linear-to-r from-orange-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-xs">
              Interactive Way
            </span>
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
            Gaurav LMS is a developer-first learning platform. Stop watching tutorials passively. Write code, solve interactive quizzes, and track your progress in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={() => navigate("/all-courses")}
              className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-sm cursor-pointer rounded-xl h-12 px-6 flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10"
            >
              Explore Courses <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById("courses-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              variant="outline"
              className="border-border text-foreground hover:bg-secondary h-12 px-6 rounded-xl text-sm font-semibold cursor-pointer bg-background"
            >
              How It Works
            </Button>
          </div>
        </div>

        {/* Hero Right Content - Interactive Code Sandbox Mockup */}
        <div className="relative z-10 w-full lg:w-fit shrink-0 select-none animate-in fade-in zoom-in duration-700 delay-200">
          <div className="relative w-full max-w-md md:w-[420px] bg-background/85 border border-border/80 rounded-2xl shadow-2xl p-5 font-mono text-xs text-orange-200/90 backdrop-blur-md">
            
            {/* Editor header tabs */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">lms-engine.js</span>
            </div>

            {/* Code lines */}
            <div className="space-y-1.5 leading-relaxed text-muted-foreground font-medium font-mono">
              <p>
                <span className="text-orange-500">function</span>{" "}
                <span className="text-blue-500">trackProgress</span>(student, course) &#123;
              </p>
              <p className="pl-4">
                <span className="text-orange-500">const</span> completed = course.contents
              </p>
              <p className="pl-8">
                .filter(c =&gt; c.isCompleted);
              </p>
              <p className="pl-4">
                <span className="text-orange-500">const</span> pct = (completed.length /
              </p>
              <p className="pl-8">
                course.contents.length) * <span className="text-amber-500">100</span>;
              </p>
              <p>&nbsp;</p>
              <p className="pl-4">
                <span className="text-orange-500">if</span> (pct === <span className="text-amber-500">100</span>) &#123;
              </p>
              <p className="pl-8">
                student.awardCertificate(course.title);
              </p>
              <p className="pl-8">
                student.notify(<span className="text-green-600 dark:text-green-400">"Certified! 🎓"</span>);
              </p>
              <p className="pl-4">&#125;</p>
              <p className="pl-4">
                <span className="text-orange-500">return</span> pct.toFixed(<span className="text-amber-500">1</span>) + <span className="text-green-600 dark:text-green-400">"%"</span>;
              </p>
              <p>&#125;</p>
            </div>

            {/* Bottom active feedback line */}
            <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                Vite Dev Server Active
              </span>
              <span>UTF-8</span>
            </div>
          </div>

          {/* Absolute floating decorations */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500/20 rounded-xl blur-md" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-500/10 rounded-full blur-lg" />
        </div>
      </div>

      {/* Courses section container */}
      <div id="courses-section" className="w-[95%] max-w-7xl mx-auto py-12">
        <CoursesList />
      </div>
    </div>
  );
};

export default HomePage;
