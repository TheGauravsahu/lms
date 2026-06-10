import { apiClient } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export const courseApi = {
  useCreateCourse: (data) => {
    return useMutation({
      mutationKey: ["create-course"],
      mutationFn: async () =>
        await apiClient.post("/courses/create-course", data),
    });
  },

  useGetAllCourses: () => {
    return useQuery({
      queryKey: ["all-courses"],
      queryFn: async () => {
        const res = await apiClient.get("/courses/all-courses");
        return res.data;
      },
    });
  },
};
