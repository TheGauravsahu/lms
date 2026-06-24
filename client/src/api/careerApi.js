import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const careerApi = {
  useGetProfile: () => {
    return useQuery({
      queryKey: ["career-profile"],
      queryFn: async () => {
        const { data } = await apiClient.get("/career/profile");
        return data.data;
      },
    });
  },

  useGetPublicProfile: (username) => {
    return useQuery({
      queryKey: ["public-profile", username],
      queryFn: async () => {
        const { data } = await apiClient.get(`/career/profile/public/${username}`);
        return data.data;
      },
      enabled: !!username,
    });
  },

  useUpdateProfile: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["update-profile"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Profile updated!");
        queryClient.invalidateQueries({ queryKey: ["career-profile"] });
      },
      mutationFn: async (profileData) => {
        return await apiClient.put("/career/profile", profileData);
      },
    });
  },

  useGetJobs: () => {
    return useQuery({
      queryKey: ["career-jobs"],
      queryFn: async () => {
        const { data } = await apiClient.get("/career/jobs");
        return data.data;
      },
    });
  },

  useStartInterview: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["start-interview"],
      onSuccess: () => {
        toast.success("Interview started. Good luck!");
        queryClient.invalidateQueries({ queryKey: ["active-interview"] });
      },
      mutationFn: async ({ role }) => {
        const { data } = await apiClient.post("/career/interview/start", { role });
        return data.data;
      },
    });
  },

  useGetActiveInterview: () => {
    return useQuery({
      queryKey: ["active-interview"],
      queryFn: async () => {
        const { data } = await apiClient.get("/career/interview/active");
        return data.data;
      },
    });
  },

  useSubmitInterviewResponse: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["submit-interview-response"],
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["active-interview"] });
        if (res.data?.data?.status === "COMPLETED") {
          toast.success("Interview completed! Grade generated.");
          queryClient.invalidateQueries({ queryKey: ["interview-history"] });
        }
      },
      mutationFn: async ({ responseText }) => {
        return await apiClient.post("/career/interview/respond", { responseText });
      },
    });
  },

  useGetInterviewsHistory: () => {
    return useQuery({
      queryKey: ["interview-history"],
      queryFn: async () => {
        const { data } = await apiClient.get("/career/interview/history");
        return data.data;
      },
    });
  },

  useAdminCreateJob: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["admin-create-job"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Job created successfully!");
        queryClient.invalidateQueries({ queryKey: ["career-jobs"] });
      },
      mutationFn: async (jobData) => {
        return await apiClient.post("/career/admin/jobs", jobData);
      },
    });
  },

  useAdminDeleteJob: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["admin-delete-job"],
      onSuccess: (res) => {
        toast.success(res.data?.message || "Job deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["career-jobs"] });
      },
      mutationFn: async (id) => {
        return await apiClient.delete(`/career/admin/jobs/${id}`);
      },
    });
  },

  useAdminGetInterviews: () => {
    return useQuery({
      queryKey: ["admin-interview-history"],
      queryFn: async () => {
        const { data } = await apiClient.get("/career/admin/interviews");
        return data.data;
      },
    });
  },
};
