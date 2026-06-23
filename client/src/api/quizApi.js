import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const quizApi = {
  useGetAllQuizzes: () =>
    useQuery({
      queryKey: ["all-quizzes"],
      queryFn: async () => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.get("/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
    }),

  useGetQuizDetails: (quizId) =>
    useQuery({
      queryKey: ["quiz-details", quizId],
      queryFn: async () => {
        if (!quizId) return null;
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.get(`/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
      enabled: !!quizId,
    }),

  useCreateQuiz: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["create-quiz"],
      onSuccess: (res) => {
        toast.success(res.message || "Quiz created successfully.");
        queryClient.invalidateQueries({ queryKey: ["all-quizzes"] });
      },
      mutationFn: async (values) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.post("/quizzes", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      },
    });
  },

  useUpdateQuiz: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["update-quiz"],
      onSuccess: (res, variables) => {
        toast.success(res.message || "Quiz updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["all-quizzes"] });
        queryClient.invalidateQueries({ queryKey: ["quiz-details", variables.quizId] });
      },
      mutationFn: async ({ quizId, ...values }) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.put(`/quizzes/${quizId}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      },
    });
  },

  useDeleteQuiz: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-quiz"],
      onSuccess: (res) => {
        toast.success(res.message || "Quiz deleted successfully.");
        queryClient.invalidateQueries({ queryKey: ["all-quizzes"] });
      },
      mutationFn: async (quizId) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.delete(`/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      },
    });
  },
};

export default quizApi;
