import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
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
