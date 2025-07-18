import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (!response.ok) {
        if (response.status === 401) {
          return null; // User not authenticated
        }
        throw new Error(`Authentication check failed: ${response.status}`);
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: false, // Don't auto-refetch
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
