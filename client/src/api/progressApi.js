import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const progressApi = {
  useGetProgress: (courseId) =>
    useQuery({
      queryKey: ["course-progress", courseId],
      queryFn: async () => {
        if (!courseId) return { completed_contents: [], progress_percentage: 0 };
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.get(`/progress/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
      enabled: !!courseId,
    }),

  useToggleProgress: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["toggle-progress"],
      onSuccess: (res, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["course-progress", variables.course_id],
        });
      },
      mutationFn: async ({ course_id, content_id }) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.post(
          "/progress/toggle",
          { course_id, content_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data.data;
      },
    });
  },
};
