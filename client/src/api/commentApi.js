import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const commentApi = {
  useGetComments: (contentId) =>
    useQuery({
      queryKey: ["content-comments", contentId],
      queryFn: async () => {
        if (!contentId) return [];
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.get(`/comments/${contentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
      enabled: !!contentId,
    }),

  useAddComment: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["add-comment"],
      onSuccess: (res, variables) => {
        toast.success("Comment posted successfully.");
        queryClient.invalidateQueries({
          queryKey: ["content-comments", variables.content_id],
        });
      },
      mutationFn: async (values) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.post("/comments", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
    });
  },

  useDeleteComment: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-comment"],
      onSuccess: (res, variables) => {
        toast.success("Comment deleted.");
        queryClient.invalidateQueries({
          queryKey: ["content-comments", variables.contentId],
        });
      },
      mutationFn: async ({ commentId, contentId }) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.delete(`/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
    });
  },
};
