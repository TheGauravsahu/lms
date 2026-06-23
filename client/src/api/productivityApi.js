import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const productivityApi = {
  // Calendar Events
  useGetCalendarEvents: () => {
    return useQuery({
      queryKey: ["calendar-events"],
      queryFn: async () => {
        const { data } = await apiClient.get("/productivity/calendar");
        return data.data;
      },
    });
  },

  useCreateCalendarEvent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["create-calendar-event"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Reminder created successfully.");
        queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      },
      mutationFn: async (eventData) => {
        return await apiClient.post("/productivity/calendar", eventData);
      },
    });
  },

  useUpdateCalendarEvent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["update-calendar-event"],
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      },
      mutationFn: async ({ id, ...updateData }) => {
        return await apiClient.put(`/productivity/calendar/${id}`, updateData);
      },
    });
  },

  useDeleteCalendarEvent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["delete-calendar-event"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Reminder deleted.");
        queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      },
      mutationFn: async (id) => {
        return await apiClient.delete(`/productivity/calendar/${id}`);
      },
    });
  },

  // Watch Later
  useGetWatchLater: () => {
    return useQuery({
      queryKey: ["watch-later"],
      queryFn: async () => {
        const { data } = await apiClient.get("/productivity/watch-later");
        return data.data;
      },
    });
  },

  useAddWatchLater: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["add-watch-later"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Added to Watch Later.");
        queryClient.invalidateQueries({ queryKey: ["watch-later"] });
      },
      mutationFn: async (contentId) => {
        return await apiClient.post("/productivity/watch-later", { contentId });
      },
    });
  },

  useRemoveWatchLater: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["remove-watch-later"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Removed from Watch Later.");
        queryClient.invalidateQueries({ queryKey: ["watch-later"] });
      },
      mutationFn: async (contentId) => {
        return await apiClient.delete(`/productivity/watch-later/${contentId}`);
      },
    });
  },

  // Video Progress (Continue Watching)
  useGetVideoProgress: () => {
    return useQuery({
      queryKey: ["video-progress"],
      queryFn: async () => {
        const { data } = await apiClient.get("/productivity/video-progress");
        return data.data;
      },
    });
  },

  useUpdateVideoProgress: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["update-video-progress"],
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["video-progress"] });
      },
      mutationFn: async (progressData) => {
        return await apiClient.post("/productivity/video-progress", progressData);
      },
    });
  },

  // Central PDF Downloads
  useGetDownloadableResources: () => {
    return useQuery({
      queryKey: ["downloadable-resources"],
      queryFn: async () => {
        const { data } = await apiClient.get("/productivity/resources");
        return data.data;
      },
    });
  },
};
