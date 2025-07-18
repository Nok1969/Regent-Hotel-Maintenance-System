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
    refetchOnWindowFocus: true,
    staleTime: 0, // Always check authentication status
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
