import { apiClient } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
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
};
