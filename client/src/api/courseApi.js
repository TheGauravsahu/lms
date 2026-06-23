import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  useSearchCourses: () => {
    return useMutation({
      mutationKey: ["search-courses"],
      mutationFn: async (query) => {
        const { data } = await apiClient.get(
          `/courses/search-course?q=${query}`,
        );
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

  useEditFolder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["edit-folder"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Folder updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["all-folders"] });
      },
      mutationFn: async (data) =>
        await apiClient.put("/courses/edit-folder", data),
    });
  },

  useDeleteFolder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-folder"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Folder deleted successfully.");
        queryClient.invalidateQueries({ queryKey: ["all-folders"] });
      },
      mutationFn: async (data) =>
        await apiClient.delete("/courses/delete-folder", { data }),
    });
  },

  useAllCourseFolders: (course_id, parent_id) => {
    return useQuery({
      queryKey: ["all-folders", course_id, parent_id],
      queryFn: async () => {
        const { data } = await apiClient.post("/courses/course-folders", {
          course_id,
          parent_id,
        });
        return data.data;
      },
    });
  },

  useGetAllCourseContents: (folder_id) => {
    return useQuery({
      queryKey: ["all-contents", folder_id],
      queryFn: async () => {
        const { data } = await apiClient.post("/courses/course-contents", {
          folder_id,
        });
        return data.data;
      },
    });
  },

  useCreateContent: () => {
    return useMutation({
      mutationKey: ["create-content"],
      onSuccess: (res) => {
        toast.success(res.data.message);
      },
      mutationFn: async (data) =>
        await apiClient.post("/courses/create-content", data),
    });
  },

  useEditContent: () => {
    return useMutation({
      mutationKey: ["edit-content"],
      onSuccess: (res) => {
        toast.success(res.data.message);
      },
      mutationFn: async (data) =>
        await apiClient.put("/courses/edit-content", data),
    });
  },

  useDeleteContent: () => {
    return useMutation({
      mutationKey: ["delete-content"],
      onSuccess: (res) => {
        toast.success(res.data.message);
      },
      mutationFn: async (data) =>
        await apiClient.post("/courses/delete-content", data),
    });
  },

  useEditCourse: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["edit-course"],
      onSuccess: (res) => {
        toast.success(res.message || "Course updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["all-courses"] });
      },
      mutationFn: async (data) => {
        const { data: d } = await apiClient.put("/courses/edit-course", data);
        return d;
      },
    });
  },

  useDeleteCourse: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-course"],
      onSuccess: (res) => {
        toast.success(res.message || "Course deleted.");
        queryClient.invalidateQueries({ queryKey: ["all-courses"] });
      },
      mutationFn: async (course_id) => {
        const { data } = await apiClient.delete("/courses/delete-course", { data: { course_id } });
        return data;
      },
    });
  },
};
