import { useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

// Debounced auth hook to prevent excessive API calls
export function useAuthDebounced() {
  const lastCallRef = useRef<number>(0);
  const DEBOUNCE_DELAY = 1000; // 1 second debounce

  const { data: user, isLoading, refetch, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;
      
      // If called too recently, wait
      if (timeSinceLastCall < DEBOUNCE_DELAY) {
        await new Promise(resolve => setTimeout(resolve, DEBOUNCE_DELAY - timeSinceLastCall));
      }
      
      lastCallRef.current = Date.now();
      
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null; // User not authenticated
        }
        throw new Error(`Authentication check failed: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: false, // Don't retry auth failures
  });

  const debouncedRefetch = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;
    
    if (timeSinceLastCall >= DEBOUNCE_DELAY) {
      refetch();
    }
  }, [refetch]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch: debouncedRefetch,
    error,
  };
}