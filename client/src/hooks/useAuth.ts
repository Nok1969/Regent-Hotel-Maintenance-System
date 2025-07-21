import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: "include", // Include cookies for session
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null; // User not authenticated
        }
        throw new Error(`Authentication check failed: ${response.status}`);
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: true, // Check auth when user returns
    staleTime: 10 * 1000, // Cache for 10 seconds
    gcTime: 30 * 1000, // Keep in cache for 30 seconds
    refetchInterval: 30 * 1000, // Check every 30 seconds
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
