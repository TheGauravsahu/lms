import { apiClient } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const uploadApi = {
  useUpload: () =>
    useMutation({
      mutationKey: ["upload"],
      onSuccess: (res) => {
        toast.success(res.message);
      },
      mutationFn: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await apiClient.post("/uploads/upload", formData);
        return data;
      },
    }),
};
