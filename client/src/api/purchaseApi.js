import { apiClient } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export const purchaseApi = {
  useCheckPurchase: (course_id) => {
    const token = useAuthStore((state) => state.token);
    return useQuery({
      queryKey: ["check-purchases", course_id, !!token],
      queryFn: async () => {
        if (!token) return false;
        const { data } = await apiClient.post("/purchases/check-purchase", {
          course_id,
        });
        return data.data.isPurchased;
      },
      enabled: !!course_id,
    });
  },

  usePurchaseCourse: (course_id) => {
    return useMutation({
      mutationKey: ["purchase-course"],
      onSuccess: (res) => {
        toast.success(res.message);
      },
      mutationFn: async () => {
        const { data } = await apiClient.post("/purchases/purchase-course", {
          course_id,
        });
        return data;
      },
    });
  },

  useGetMyPurchasedCourses: () => {
    return useQuery({
      queryKey: ["my-purchased-courses"],
      queryFn: async () => {
        const { data } = await apiClient.get("/purchases/my-purchased-courses");
        return data.data;
      },
    });
  },
};
