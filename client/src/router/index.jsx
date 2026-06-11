import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminLayout from "@/pages/Admin/AdminLayout";
import CourseDetails from "@/pages/Admin/Courses/CourseDetails";
import CourseDetailsLayout from "@/pages/Admin/Courses/CourseDetailsLayout";
import CourseFolderDetails from "@/pages/Admin/Courses/CourseFolderDetails";
import CreateCourse from "@/pages/Admin/Courses/CreateCourse";
import MyCourses from "@/pages/Admin/Courses/MyCourses";
import NewFolder from "@/pages/Admin/Courses/NewFolder";
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
            element: <CourseDetailsLayout />,
            children: [
              {
                index: true,
                element: <CourseDetails />,
              },
              {
                path: "folders",
                children: [
                  {
                    index: true,
                    element: <CourseDetails />,
                  },
                  {
                    path: ":folder_id",
                    element: <CourseFolderDetails />,
                  },
                  {
                    path: "new-folder",
                    element: <NewFolder />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
