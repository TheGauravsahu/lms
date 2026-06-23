import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const forumApi = {
  useGetForumPosts: (params = {}) =>
    useQuery({
      queryKey: ["forum-posts", params],
      queryFn: async () => {
        const { data } = await apiClient.get("/forums", { params });
        return data.data;
      },
    }),

  useGetForumPost: (postId) =>
    useQuery({
      queryKey: ["forum-post", postId],
      queryFn: async () => {
        const { data } = await apiClient.get(`/forums/${postId}`);
        return data.data;
      },
      enabled: !!postId,
    }),

  useCreateForumPost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["create-forum-post"],
      onSuccess: (res) => {
        toast.success(res.message || "Post created!");
        queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      },
      onError: (err) => toast.error(err?.response?.data?.error || "Failed to create post."),
      mutationFn: async (values) => {
        const { data } = await apiClient.post("/forums", values);
        return data;
      },
    });
  },

  useAddForumReply: (postId) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["add-forum-reply"],
      onSuccess: (res) => {
        toast.success("Reply added!");
        queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
        queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      },
      onError: (err) => toast.error(err?.response?.data?.error || "Failed to add reply."),
      mutationFn: async ({ postId: pid, body }) => {
        const { data } = await apiClient.post(`/forums/${pid}/replies`, { body });
        return data;
      },
    });
  },

  useUpvotePost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (postId) => {
        const { data } = await apiClient.post(`/forums/${postId}/upvote`);
        return data;
      },
      onSuccess: (_, postId) => {
        queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
        queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      },
    });
  },

  useUpvoteReply: (postId) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ postId: pid, replyId }) => {
        const { data } = await apiClient.post(`/forums/${pid}/replies/${replyId}/upvote`);
        return data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-post", postId] }),
    });
  },

  useAcceptReply: (postId) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ postId: pid, replyId }) => {
        const { data } = await apiClient.post(`/forums/${pid}/replies/${replyId}/accept`);
        return data;
      },
      onSuccess: () => {
        toast.success("Answer accepted!");
        queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
      },
    });
  },

  useDeletePost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (postId) => {
        const { data } = await apiClient.delete(`/forums/${postId}`);
        return data;
      },
      onSuccess: (res) => {
        toast.success(res.message || "Post deleted.");
        queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      },
    });
  },

  usePinPost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (postId) => {
        const { data } = await apiClient.patch(`/forums/${postId}/pin`);
        return data;
      },
      onSuccess: (res) => {
        toast.success(res.message || "Pin toggled.");
        queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      },
    });
  },
};
