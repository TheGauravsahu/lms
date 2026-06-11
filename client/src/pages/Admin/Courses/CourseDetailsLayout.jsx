import { Outlet, useParams } from "react-router";
import RouteBreadcrumb from "../RouteBreadcrumb";
import { courseApi } from "@/api/courseApi";
import LoadingScreen from "@/components/loading-screen";
import ErrorOccured from "@/components/error-occured";
import CourseBanner from "@/components/admin/courses/course-banner";


const CourseDetailsLayout = () => {
  const { course_id } = useParams();
  const { data, isPending, isError } = courseApi.useGetCourseDetails(course_id);

  if (isPending) return <LoadingScreen />;
  if (isError) return <ErrorOccured />;

  return (
    <div>
      <RouteBreadcrumb />
      <div>
        {/* Banner */}
        <CourseBanner data={data} />

        <div className="pl-2 pt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsLayout;
