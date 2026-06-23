import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const studyGroupApi = {
  useGetStudyGroups: (params = {}) =>
    useQuery({
      queryKey: ["study-groups", params],
      queryFn: async () => {
        const { data } = await apiClient.get("/study-groups", { params });
        return data.data;
      },
    }),

  useGetMyStudyGroups: () =>
    useQuery({
      queryKey: ["my-study-groups"],
      queryFn: async () => {
        const { data } = await apiClient.get("/study-groups/my");
        return data.data;
      },
    }),

  useGetStudyGroup: (groupId) =>
    useQuery({
      queryKey: ["study-group", groupId],
      queryFn: async () => {
        const { data } = await apiClient.get(`/study-groups/${groupId}`);
        return data.data;
      },
      enabled: !!groupId,
    }),

  useGetGroupMessages: (groupId, enabled = true) =>
    useQuery({
      queryKey: ["group-messages", groupId],
      queryFn: async () => {
        const { data } = await apiClient.get(`/study-groups/${groupId}/messages`);
        return data.data;
      },
      enabled: !!groupId && enabled,
      refetchInterval: 5000, // Poll every 5 seconds
    }),

  useCreateStudyGroup: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["create-study-group"],
      onSuccess: (res) => {
        toast.success(res.message || "Study group created!");
        queryClient.invalidateQueries({ queryKey: ["study-groups"] });
        queryClient.invalidateQueries({ queryKey: ["my-study-groups"] });
      },
      onError: (err) => toast.error(err?.response?.data?.error || "Failed to create group."),
      mutationFn: async (values) => {
        const { data } = await apiClient.post("/study-groups", values);
        return data;
      },
    });
  },

  useJoinStudyGroup: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ groupId, inviteCode }) => {
        const { data } = await apiClient.post(`/study-groups/${groupId}/join`, { inviteCode });
        return data;
      },
      onSuccess: (res) => {
        toast.success(res.message || "Joined group!");
        queryClient.invalidateQueries({ queryKey: ["study-groups"] });
        queryClient.invalidateQueries({ queryKey: ["my-study-groups"] });
      },
      onError: (err) => toast.error(err?.response?.data?.error || "Failed to join group."),
    });
  },

  useLeaveStudyGroup: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (groupId) => {
        const { data } = await apiClient.post(`/study-groups/${groupId}/leave`);
        return data;
      },
      onSuccess: (res) => {
        toast.success(res.message || "Left group.");
        queryClient.invalidateQueries({ queryKey: ["study-groups"] });
        queryClient.invalidateQueries({ queryKey: ["my-study-groups"] });
      },
    });
  },

  usePostGroupMessage: (groupId) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ groupId: gid, message }) => {
        const { data } = await apiClient.post(`/study-groups/${gid}/messages`, { message });
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["group-messages", groupId] });
      },
      onError: (err) => toast.error(err?.response?.data?.error || "Failed to send message."),
    });
  },

  useDeleteStudyGroup: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (groupId) => {
        const { data } = await apiClient.delete(`/study-groups/${groupId}`);
        return data;
      },
      onSuccess: (res) => {
        toast.success(res.message || "Group deleted.");
        queryClient.invalidateQueries({ queryKey: ["study-groups"] });
        queryClient.invalidateQueries({ queryKey: ["my-study-groups"] });
      },
    });
  },
};
