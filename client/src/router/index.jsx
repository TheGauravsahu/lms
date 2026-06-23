import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminLayout from "@/pages/Admin/AdminLayout";
import CourseDetails from "@/pages/Admin/Courses/CourseDetails";
import CourseDetailsLayout from "@/pages/Admin/Courses/CourseDetailsLayout";
import CreateCourse from "@/pages/Admin/Courses/CreateCourse";
import MyCourses from "@/pages/Admin/Courses/MyCourses";
import NewFolder from "@/pages/Admin/Courses/Folder/NewFolder";
import { createBrowserRouter } from "react-router";
import ContentDetails from "@/pages/Admin/Courses/Content/ContentDetails";
import FolderDetails from "@/pages/Admin/Courses/Folder/FolderDetails";
import NewContent from "@/pages/Admin/Courses/Content/NewContent";
import HomePage from "@/pages/Home/HomePage";
import UserLayout from "@/pages/Home/UserLayout";
import AllCourses from "@/pages/Home/AllCourses";
import MyCourse from "@/pages/MyCourse/MyCourse";
import { AuthGuard, AdminGuard } from "@/components/auth/AuthGuard";
import ProfileSettings from "@/pages/Home/ProfileSettings";
import AdminUploadPage from "@/pages/Admin/AdminUploadPage";
import StudentsList from "@/pages/Admin/Students/StudentsList";
import StudentDashboard from "@/pages/Home/StudentDashboard";
import AdminQuizzes from "@/pages/Admin/Quizzes/AdminQuizzes";
import Quizzes from "@/pages/Home/Quizzes";
import Sandbox from "@/pages/Home/Sandbox";
import Leaderboard from "@/pages/Home/Leaderboard";

export const router = createBrowserRouter([
  // user_ui
  {
    path: "/",
    children: [
      { index: true, element: <HomePage /> },
      
      // Protected user routes
      {
        element: <AuthGuard />,
        children: [
          {
            path: "my-courses",
            element: <UserLayout />,
            children: [{ index: true, element: <MyCourse /> }],
          },
          {
            path: "my-account",
            element: <UserLayout />,
            children: [{ index: true, element: <ProfileSettings /> }],
          },
          {
            path: "setting",
            element: <UserLayout />,
            children: [{ index: true, element: <ProfileSettings /> }],
          },
          {
            path: "dashboard",
            element: <UserLayout />,
            children: [{ index: true, element: <StudentDashboard /> }],
          },
          {
            path: "quizzes",
            element: <UserLayout />,
            children: [{ index: true, element: <Quizzes /> }],
          },
          {
            path: "sandbox",
            element: <UserLayout />,
            children: [{ index: true, element: <Sandbox /> }],
          },
          {
            path: "leaderboard",
            element: <UserLayout />,
            children: [{ index: true, element: <Leaderboard /> }],
          },
        ],
      },
      
      {
        path: "all-courses",
        element: <UserLayout />,
        children: [
          { index: true, element: <AllCourses /> },
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
                    element: <FolderDetails />,
                  },
                ],
              },
              {
                path: "contents",
                element: <ContentDetails />,
              },
            ],
          },
        ],
      },
    ],
  },

  // admin_ui
  {
    path: "/admin",
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          {
            path: "setting",
            element: <ProfileSettings />,
          },
          {
            path: "uploads",
            element: <AdminUploadPage />,
          },
          {
            path: "students",
            element: <StudentsList />,
          },
          {
            path: "quizzes",
            element: <AdminQuizzes />,
          },
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
                        element: <FolderDetails />,
                      },
                      {
                        path: "new-folder",
                        element: <NewFolder />,
                      },
                    ],
                  },
                  {
                    path: "contents",
                    children: [
                      { index: true, element: <ContentDetails /> },
                      { path: "new-content", element: <NewContent /> },
                    ],
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
