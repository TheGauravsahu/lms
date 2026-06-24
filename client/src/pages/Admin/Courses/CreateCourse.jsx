import RouteBreadcrumb from "../RouteBreadcrumb";
import CreateCourseForm from "@/components/admin/courses/create-course-form";
import { Sparkles } from "lucide-react";

const CreateCourse = () => {
  return (
    <div className="space-y-6">
      <RouteBreadcrumb />
      
      {/* Premium Page Header */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-black text-2xl text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500/10" />
            Create Course
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            The course will be published and made live once you set its status visibility flag.
          </p>
        </div>
      </div>

      <CreateCourseForm />
    </div>
  );
};

export default CreateCourse;
