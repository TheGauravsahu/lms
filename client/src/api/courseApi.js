import { apiClient } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const courseApi = {
  useCreateCourse: () => {
    return useMutation({
      mutationKey: ["create-course"],
      onSuccess: (res) => {
        toast.success(res.data.message);
      },
      mutationFn: async (data) =>
        await apiClient.post("/courses/create-course", data),
    });
  },

  useGetAllCourses: () => {
    return useQuery({
      queryKey: ["all-courses"],
      queryFn: async () => {
        const { data } = await apiClient.get("/courses/all-courses");
        return data.data;
      },
    });
  },

  useGetCourseDetails: (course_id) => {
    return useQuery({
      queryKey: ["course-details", course_id],
      queryFn: async () => {
        const { data } = await apiClient.post("/courses/course-details", {
          course_id,
        });
        return data.data;
      },
    });
  },

  useCreateFolder: () => {
    const navigate = useNavigate();
    return useMutation({
      mutationKey: ["create-folder"],
      onSuccess: (res) => {
        toast.success(res.data.message);
        navigate("/admin/courses/" + res.data.data.course_id);
      },
      mutationFn: async (data) =>
        await apiClient.post("/courses/create-folder", data),
    });
  },

  useAllCourseFolders: (course_id, parent_id) => {
    return useQuery({
      queryKey: ["all-folder", course_id, parent_id],
      queryFn: async () => {
        const { data } = await apiClient.post("/courses/course-folders", {
          course_id,
          parent_id,
        });
        return data.data;
      },
    });
  },
};
