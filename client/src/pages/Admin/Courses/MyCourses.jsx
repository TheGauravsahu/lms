import { courseApi } from "@/api/courseApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatDate";
import CourseStatus from "../../../components/admin/courses/course-status";
import ErrorOccured from "@/components/error-occured";
import LoadingScreen from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

const MyCourses = () => {
  const navigate = useNavigate();
  const { data, isPending, error } = courseApi.useGetAllCourses();
  if (isPending) return <LoadingScreen />;
  if (error) return <ErrorOccured />;

  return (
    <div className="h-full">
      <div>
        <h1 className="tracking-tight font-semibold text-2xl">My Courses</h1>
      </div>

      <div className="flex items-center justify-between">
        {/* header */}
        <div className="border-b-black border-b-2 pb-1 font-[550] mt-8 w-32">
          <span className="flex items-center">
            My Course
            <div className="flex items-center justify-center ml-1 bg-secondary rounded-full text-xs p-1 h-5 w-5">
              {data.length}
            </div>
          </span>
        </div>
        <Button onClick={() => navigate("/admin/courses/create-course")}>
          <Plus /> New course
        </Button>
      </div>

      {/* table */}
      <Table className="border rounded-lg mt-4">
        <TableHeader>
          <TableRow className="*:text-muted-foreground *:uppercase">
            <TableHead>Course</TableHead>
            <TableHead>Course Id</TableHead>
            <TableHead>Offer Price</TableHead>
            <TableHead>Original Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c) => (
            <TableRow key={c._id}>
              <TableCell
                onClick={() => navigate("/admin/courses/" + c._id)}
                className="flex items-start gap-8 p-4 cursor-pointer"
              >
                <div className="w-42 h-32 overflow-hidden rounded-md">
                  <img
                    src={c.thumbnail.url}
                    alt={c.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-semibold text-xl">{c.title}</h2>
                  <span className="text-muted-foreground text-xs">
                    Created: {formatDate(c.createdAt)}
                  </span>
                  <span className="bg-secondary text-xs w-fit rounded-full px-3 py-1">
                    <CourseStatus status={c.status} />
                  </span>
                </div>
              </TableCell>
              <TableCell>{c._id}</TableCell>
              <TableCell>{c.offer_price}</TableCell>
              <TableCell>{c.original_price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MyCourses;
