import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const peerReviewApi = {
  useGetPeerReviews: (params = {}) =>
    useQuery({
      queryKey: ["peer-reviews", params],
      queryFn: async () => {
        const { data } = await apiClient.get("/peer-reviews", { params });
        return data.data;
      },
    }),

  useGetPeerReview: (reviewId) =>
    useQuery({
      queryKey: ["peer-review", reviewId],
      queryFn: async () => {
        const { data } = await apiClient.get(`/peer-reviews/${reviewId}`);
        return data.data;
      },
      enabled: !!reviewId,
    }),

  useSubmitPeerReview: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["submit-peer-review"],
      onSuccess: (res) => {
        toast.success(res.message || "Code submitted for review!");
        queryClient.invalidateQueries({ queryKey: ["peer-reviews"] });
      },
      onError: (err) => toast.error(err?.response?.data?.error || "Failed to submit."),
      mutationFn: async (values) => {
        const { data } = await apiClient.post("/peer-reviews", values);
        return data;
      },
    });
  },

  useAddReviewComment: (reviewId) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["add-review-comment"],
      onSuccess: (res) => {
        toast.success(res.message || "Comment added! +30 XP earned.");
        queryClient.invalidateQueries({ queryKey: ["peer-review", reviewId] });
        queryClient.invalidateQueries({ queryKey: ["account-details"] });
      },
      onError: (err) => toast.error(err?.response?.data?.error || "Failed to add comment."),
      mutationFn: async ({ reviewId: rid, comment, lineNumber }) => {
        const { data } = await apiClient.post(`/peer-reviews/${rid}/comment`, {
          comment,
          lineNumber,
        });
        return data;
      },
    });
  },

  useCloseReview: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (reviewId) => {
        const { data } = await apiClient.patch(`/peer-reviews/${reviewId}/close`);
        return data;
      },
      onSuccess: (res) => {
        toast.success(res.message || "Review closed.");
        queryClient.invalidateQueries({ queryKey: ["peer-reviews"] });
        queryClient.invalidateQueries({ queryKey: ["peer-review"] });
      },
    });
  },

  useRateReview: (reviewId) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ reviewId: rid, rating }) => {
        const { data } = await apiClient.post(`/peer-reviews/${rid}/rate`, { rating });
        return data;
      },
      onSuccess: () => {
        toast.success("Review rated!");
        queryClient.invalidateQueries({ queryKey: ["peer-review", reviewId] });
      },
    });
  },

  useDeletePeerReview: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (reviewId) => {
        const { data } = await apiClient.delete(`/peer-reviews/${reviewId}`);
        return data;
      },
      onSuccess: (res) => {
        toast.success(res.message || "Review deleted.");
        queryClient.invalidateQueries({ queryKey: ["peer-reviews"] });
      },
    });
  },
};
