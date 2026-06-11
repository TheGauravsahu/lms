import RouteBreadcrumb from "../RouteBreadcrumb";
import CreateCourseForm from "@/components/admin/courses/create-course-form";

const CreateCourse = () => {
  return (
    <div className="">
      <RouteBreadcrumb />
      <div className="p-4 mt-4">
        <h1 className="font-semibold text-xl">Create Course</h1>
        <h3 className="text-muted-foreground text-xs my-2">
          The course will be pulished once you mark status as pulished.
        </h3>

        <CreateCourseForm />
      </div>
    </div>
  );
};

export default CreateCourse;
