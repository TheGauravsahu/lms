import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const flashcardApi = {
  useGetSets: () => {
    return useQuery({
      queryKey: ["flashcard-sets"],
      queryFn: async () => {
        const { data } = await apiClient.get("/flashcards");
        return data.data;
      },
    });
  },

  useCreateSet: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["create-flashcard-set"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Flashcard set created!");
        queryClient.invalidateQueries({ queryKey: ["flashcard-sets"] });
      },
      mutationFn: async (setData) => {
        return await apiClient.post("/flashcards/create", setData);
      },
    });
  },

  useDeleteSet: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-flashcard-set"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Flashcard set deleted.");
        queryClient.invalidateQueries({ queryKey: ["flashcard-sets"] });
      },
      mutationFn: async (id) => {
        return await apiClient.delete(`/flashcards/${id}`);
      },
    });
  },

  useGenerateAiSet: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["generate-ai-flashcard-set"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "AI Flashcards generated!");
        queryClient.invalidateQueries({ queryKey: ["flashcard-sets"] });
      },
      mutationFn: async (topicData) => {
        return await apiClient.post("/flashcards/generate-ai", topicData);
      },
    });
  },

  useToggleMastery: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["toggle-card-mastery"],
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["flashcard-sets"] });
      },
      mutationFn: async ({ setId, cardId }) => {
        return await apiClient.post("/flashcards/toggle-mastery", { setId, cardId });
      },
    });
  },
};
