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

  usePurchaseCourse: () => {
    return useMutation({
      mutationKey: ["purchase-course"],
      onSuccess: (res) => {
        toast.success(res.message);
      },
      mutationFn: async (course_id) => {
        const { data } = await apiClient.post("/purchases/purchase-course", {
          course_id,
        });
        return data;
      },
    });
  },
};
