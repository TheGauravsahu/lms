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
import Forums from "@/pages/Home/Forums";
import ForumPost from "@/pages/Home/ForumPost";
import StudyGroups from "@/pages/Home/StudyGroups";
import StudyGroupDetail from "@/pages/Home/StudyGroupDetail";
import PeerReviews from "@/pages/Home/PeerReviews";
import PeerReviewDetail from "@/pages/Home/PeerReviewDetail";
import AdminForums from "@/pages/Admin/Community/AdminForums";
import AdminStudyGroups from "@/pages/Admin/Community/AdminStudyGroups";
import AdminPeerReviews from "@/pages/Admin/Community/AdminPeerReviews";
import AdminLeaderboard from "@/pages/Admin/Community/AdminLeaderboard";
import Announcements from "@/pages/Home/Announcements";
import Calendar from "@/pages/Home/Calendar";
import Resources from "@/pages/Home/Resources";
import WatchLater from "@/pages/Home/WatchLater";
import GlobalSearch from "@/pages/Home/GlobalSearch";
import AdminAnnouncements from "@/pages/Admin/Announcements/AdminAnnouncements";
import AiTutor from "@/pages/Home/AiTutor";
import AiRoadmap from "@/pages/Home/AiRoadmap";
import NotFound from "@/pages/Home/NotFound";
import Flashcards from "@/pages/Home/Flashcards";
import AiToolCenter from "@/pages/Home/AiToolCenter";
import LearnerProfile from "@/pages/Home/LearnerProfile";
import PublicProfile from "@/pages/Home/PublicProfile";
import ResumeBuilder from "@/pages/Home/ResumeBuilder";
import JobBoard from "@/pages/Home/JobBoard";
import MockInterview from "@/pages/Home/MockInterview";

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
          {
            path: "forums",
            element: <UserLayout />,
            children: [
              { index: true, element: <Forums /> },
              { path: ":postId", element: <ForumPost /> },
            ],
          },
          {
            path: "study-groups",
            element: <UserLayout />,
            children: [
              { index: true, element: <StudyGroups /> },
              { path: ":groupId", element: <StudyGroupDetail /> },
            ],
          },
          {
            path: "peer-reviews",
            element: <UserLayout />,
            children: [
              { index: true, element: <PeerReviews /> },
              { path: ":reviewId", element: <PeerReviewDetail /> },
            ],
          },
          {
            path: "announcements",
            element: <UserLayout />,
            children: [{ index: true, element: <Announcements /> }],
          },
          {
            path: "productivity",
            element: <UserLayout />,
            children: [
              { path: "calendar", element: <Calendar /> },
              { path: "resources", element: <Resources /> },
              { path: "watch-later", element: <WatchLater /> },
              { path: "flashcards", element: <Flashcards /> },
            ],
          },
          {
            path: "search",
            element: <UserLayout />,
            children: [{ index: true, element: <GlobalSearch /> }],
          },
          {
            path: "ai-tutor",
            element: <UserLayout />,
            children: [{ index: true, element: <AiTutor /> }],
          },
          {
            path: "ai-roadmap",
            element: <UserLayout />,
            children: [{ index: true, element: <AiRoadmap /> }],
          },
          {
            path: "ai-tools",
            element: <UserLayout />,
            children: [{ index: true, element: <AiToolCenter /> }],
          },
          {
            path: "career",
            element: <UserLayout />,
            children: [
              { path: "profile", element: <LearnerProfile /> },
              { path: "resume", element: <ResumeBuilder /> },
              { path: "jobs", element: <JobBoard /> },
              { path: "interview", element: <MockInterview /> },
            ],
          },
        ],
      },
      {
        path: "career/profile/public/:username",
        element: <PublicProfile />,
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
            path: "leaderboard",
            element: <AdminLeaderboard />,
          },
          {
            path: "announcements",
            element: <AdminAnnouncements />,
          },
          {
            path: "community",
            children: [
              { path: "forums", element: <AdminForums /> },
              { path: "study-groups", element: <AdminStudyGroups /> },
              { path: "peer-reviews", element: <AdminPeerReviews /> },
            ],
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
      // Catch-all 404 page
      {
        path: "*",
        element: <UserLayout />,
        children: [{ index: true, element: <NotFound /> }],
      },
    ],
  },
]);
