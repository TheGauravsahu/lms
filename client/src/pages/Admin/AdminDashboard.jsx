import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Banner */}
      <div className="w-full bg-[#EE856D] h-64 rounded-xl flex items-center gap-2 justify-between">
        <div className="flex flex-col h-full justify-between p-4 py-6">
          <h1 className="text-white font-serif text-5xl">
            Add your courses to get started
          </h1>
          <Button
            onClick={() => navigate("/admin/courses/create-course")}
            variant="outline"
            className="w-fit cursor-pointer"
          >
            Add Course
            <ChevronDown />
          </Button>
        </div>
        <div className="w-1/2 h-full flex items-end justify-end px-4">
          <div className="w-[72%] overflow-hidden">
            <img
              src="/add_post.svg"
              alt="add courses"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="mt-8">
        <h1 className="font-semibold text-xl">Overview</h1>
        <div className="flex gap-4 items-center my-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-secondary border h-28 w-62 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>
                  <User />
                </span>
                <span>Total Students</span>
              </div>

              <span className="font-semibold text-2xl ml-8 mt-2">42</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
