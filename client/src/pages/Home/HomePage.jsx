import LoginModal from "@/components/auth/login-modal";
import CommandMenu from "@/components/home/command-menu";
import CoursesList from "@/components/home/courses-list";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

import { useNavigate } from "react-router";

const HomePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));



  return (
    <div>
      <header className="bg-background p-4 px-12 border-b sticky top-0 right-0 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-8 overflow-hidden">
              <img src="/icon.png" alt="lms_icon" className="w-full h-full" />
            </div>
            <h1 className="tracking-tight font-semibold t">
              Gaurav <span className="text-muted-foreground">LMS</span>
            </h1>
          </div>

          <CommandMenu />
        </div>

        <nav className="flex items-center gap-4">
          <h2
            onClick={() => navigate("/courses")}
            className="text-sm cursor-pointer"
          >
            Courses
          </h2>

          {user ? (
            <span>Hi, {user.name}</span>
          ) : (
            <LoginModal>
              <Button className="bg-linear-to-b from-orange-300 to-red-500 cursor-pointer rounded-sm">
                Login/Register
              </Button>
            </LoginModal>
          )}
        </nav>
      </header>

      <div className="w-[90%] mx-auto rounded-lg h-52 bg-linear-to-b from-orange-500   mt-8 flex justify-between p-8">
        <div className="flex flex-col h-full justify-between p-4 py-6">
          <h1 className="text-white font-serif text-5xl">
            Explore high-quality courses
          </h1>
          <Button
            onClick={() => navigate("/all-courses")}
            variant="outline"
            className="w-fit cursor-pointer shadow-none rounded-sm mt-6"
          >
            Go to Courses
            <ChevronRight />
          </Button>
        </div>

        <img src="/learning.svg" className="w-64 h-40" alt="learning" />
      </div>

      <CoursesList />
    </div>
  );
};

export default HomePage;
