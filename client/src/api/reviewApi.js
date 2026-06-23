import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const reviewApi = {
  useGetCourseReviews: (courseId) =>
    useQuery({
      queryKey: ["course-reviews", courseId],
      queryFn: async () => {
        if (!courseId) return { reviews: [], summary: { averageRating: 0, totalReviews: 0, ratingDistribution: {} } };
        const { data } = await apiClient.get(`/reviews/${courseId}`);
        return data.data;
      },
      enabled: !!courseId,
    }),

  useAddReview: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["add-review"],
      onSuccess: (res, variables) => {
        toast.success("Review submitted successfully.");
        queryClient.invalidateQueries({
          queryKey: ["course-reviews", variables.course_id],
        });
      },
      mutationFn: async (values) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.post("/reviews", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
    });
  },

  useDeleteReview: (courseId) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-review"],
      onSuccess: () => {
        toast.success("Review deleted successfully.");
        queryClient.invalidateQueries({
          queryKey: ["course-reviews", courseId],
        });
      },
      mutationFn: async (reviewId) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.delete(`/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
    });
  },
};

export default reviewApi;
