import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const aiApi = {
  // AI Tutor Chat Sessions
  useGetChatSessions: () => {
    return useQuery({
      queryKey: ["ai-chat-sessions"],
      queryFn: async () => {
        const { data } = await apiClient.get("/ai/tutor/sessions");
        return data.data;
      },
    });
  },

  useGetChatSessionDetails: (id) => {
    return useQuery({
      queryKey: ["ai-chat-session", id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/ai/tutor/sessions/${id}`);
        return data.data;
      },
      enabled: !!id,
    });
  },

  useDeleteChatSession: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-chat-session"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Chat session deleted.");
        queryClient.invalidateQueries({ queryKey: ["ai-chat-sessions"] });
      },
      mutationFn: async (id) => {
        return await apiClient.delete(`/ai/tutor/sessions/${id}`);
      },
    });
  },

  useSendChatMessage: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["send-chat-message"],
      onSuccess: (res) => {
        const session = res.data?.data?.session;
        queryClient.invalidateQueries({ queryKey: ["ai-chat-sessions"] });
        if (session?._id) {
          queryClient.invalidateQueries({ queryKey: ["ai-chat-session", session._id] });
        }
      },
      mutationFn: async (chatData) => {
        return await apiClient.post("/ai/tutor/chat", chatData);
      },
    });
  },

  // AI Notes Generator
  useGenerateNotes: () => {
    return useMutation({
      mutationKey: ["generate-notes"],
      mutationFn: async ({ lessonTitle, context }) => {
        const { data } = await apiClient.post("/ai/notes", { lessonTitle, context });
        return data.data;
      },
    });
  },

  // AI Quiz Generator
  useGenerateQuiz: () => {
    return useMutation({
      mutationKey: ["generate-quiz"],
      mutationFn: async ({ lessonTitle, context }) => {
        const { data } = await apiClient.post("/ai/quiz", { lessonTitle, context });
        return data.data;
      },
    });
  },

  // AI Roadmap
  useGetRoadmaps: () => {
    return useQuery({
      queryKey: ["ai-roadmaps"],
      queryFn: async () => {
        const { data } = await apiClient.get("/ai/roadmap");
        return data.data;
      },
    });
  },

  useCreateRoadmap: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["create-roadmap"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Learning Roadmap generated & saved!");
        queryClient.invalidateQueries({ queryKey: ["ai-roadmaps"] });
      },
      mutationFn: async (roadmapData) => {
        return await apiClient.post("/ai/roadmap", roadmapData);
      },
    });
  },

  useDeleteRoadmap: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-roadmap"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Roadmap deleted.");
        queryClient.invalidateQueries({ queryKey: ["ai-roadmaps"] });
      },
      mutationFn: async (id) => {
        return await apiClient.delete(`/ai/roadmap/${id}`);
      },
    });
  },
};
