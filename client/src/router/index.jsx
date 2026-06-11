import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminLayout from "@/pages/Admin/AdminLayout";
import CourseDetails from "@/pages/Admin/Courses/CourseDetails";
import CreateCourse from "@/pages/Admin/Courses/CreateCourse";
import MyCourses from "@/pages/Admin/Courses/MyCourses";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  // admin_ui
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      {
        path: "courses",
        children: [
          {
            index: true,
            element: <MyCourses />,
          },
          {
            path: "create-course",
            element: <CreateCourse />,
          },
          {
            path: ":course_id",
            element: <CourseDetails />,
          },
        ],
      },
    ],
  },
]);
