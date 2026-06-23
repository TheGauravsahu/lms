import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const searchApi = {
  useGlobalSearch: (query) => {
    return useQuery({
      queryKey: ["global-search", query],
      queryFn: async () => {
        if (!query || !query.trim()) {
          return { lessons: [], quizzes: [], forums: [] };
        }
        const { data } = await apiClient.get(`/search/global?q=${encodeURIComponent(query)}`);
        return data.data;
      },
      enabled: !!query && query.trim().length > 0,
    });
  },
};
