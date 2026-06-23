import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";

export const adminApi = {
  useGetDashboardStats: () =>
    useQuery({
      queryKey: ["admin-dashboard-stats"],
      queryFn: async () => {
        const token = useAuthStore.getState().token;
        const { data } = await apiClient.get("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.data;
      },
    }),
};
