import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const authApi = {
  useSendOtp: () =>
    useMutation({
      mutationKey: ["send-otp"],
      onSuccess: (res) => {
        toast.success(res.message);
      },
      mutationFn: async (values) => {
        const { data } = await apiClient.post("/auth/send-otp", values);
        return data;
      },
    }),

  useVerifyOtp: () => {
    const login = useAuthStore.getState().login;
    
    return useMutation({
      mutationKey: ["verify-otp"],
      onSuccess: (res) => {
        toast.success(res.message);
        login({
          token: res.data.token,
          user: res.data.account,
        });
      },
      mutationFn: async (values) => {
        const { data } = await apiClient.post("/auth/verify-otp", values);
        return data;
      },
    });
  },

  useEditAccount: () => {
    const login = useAuthStore.getState().login;

    return useMutation({
      mutationKey: ["edit-account"],
      onSuccess: (res) => {
        toast.success(res.message || "Profile updated successfully.");
        const token = useAuthStore.getState().token;
        login({
          token,
          user: res.data,
        });
      },
      mutationFn: async (values) => {
        const { data } = await apiClient.post("/auth/edit-account", values);
        return data;
      },
    });
  },
};
