import { useParams } from "react-router";
import RouteBreadcrumb from "../RouteBreadcrumb";

const CourseDetails = () => {
  const { course_id } = useParams();
  console.log(course_id);

  return <div>
    <RouteBreadcrumb />
  </div>;
};

export default CourseDetails;
