import { apiClient } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const purchaseApi = {
  useCheckPurchase: (course_id) => {
    return useQuery({
      queryKey: ["check-purchases", course_id],
      queryFn: async () => {
        const { data } = await apiClient.post("/purchases/check-purchase", {
          course_id,
        });
        return data.data.isPurchased;
      },
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
        const { data } = await apiClient.post("/purchases/my-purchased-courses");
        return data.data;
      },
    });
  },
};
