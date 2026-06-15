import { apiClient } from "@/lib/axios";
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
    return useMutation({
      mutationKey: ["verify-otp"],
      onSuccess: (res) => {
        toast.success(res.message);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.account));
      },
      mutationFn: async (values) => {
        const { data } = await apiClient.post("/auth/verify-otp", values);
        return data;
      },
    });
  },
};
