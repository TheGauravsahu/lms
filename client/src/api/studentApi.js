import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const studentApi = {
  useGetAllStudents: () =>
    useQuery({
      queryKey: ["all-students"],
      queryFn: async () => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.get("/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
    }),

  useAddStudent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["add-student"],
      onSuccess: (res) => {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["all-students"] });
      },
      mutationFn: async (values) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.post("/students", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      },
    });
  },

  useEditStudent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["edit-student"],
      onSuccess: (res) => {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["all-students"] });
      },
      mutationFn: async ({ id, ...values }) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.put(`/students/${id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      },
    });
  },

  useDeleteStudent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-student"],
      onSuccess: (res) => {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["all-students"] });
      },
      mutationFn: async (id) => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.delete(`/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      },
    });
  },

  useGetLeaderboard: () =>
    useQuery({
      queryKey: ["leaderboard"],
      queryFn: async () => {
        const { data } = await apiClient.get("/students/leaderboard");
        return data.data;
      },
    }),

  useEarnRewards: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["earn-rewards"],
      onSuccess: (res) => {
        if (res.unlockedBadge) {
          toast.success(`🎉 New Badge Unlocked: ${res.unlockedBadge}!`);
        }
        queryClient.invalidateQueries({ queryKey: ["account-details"] });
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      },
      mutationFn: async ({ xp, badge }) => {
        const { data } = await apiClient.post("/students/earn-xp", { xp, badge });
        return data.data;
      },
    });
  },
};
