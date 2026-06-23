import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const announcementApi = {
  useGetAnnouncements: () => {
    return useQuery({
      queryKey: ["announcements"],
      queryFn: async () => {
        const { data } = await apiClient.get("/announcements");
        return data.data;
      },
    });
  },

  useCreateAnnouncement: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["create-announcement"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Announcement created successfully.");
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
      },
      mutationFn: async (data) => {
        return await apiClient.post("/announcements", data);
      },
    });
  },

  useDeleteAnnouncement: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-announcement"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Announcement deleted.");
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
      },
      mutationFn: async (id) => {
        return await apiClient.delete(`/announcements/${id}`);
      },
    });
  },
};
