import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api";
import { authApi } from "./api";

export const authKeys = {
  me: ["auth", "me"] as const,
};

/**
 * The current user, or null when signed out. A 401 means "not signed in", which
 * is a normal state, so it resolves to null instead of an error.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const { user } = await authApi.me();
        return user;
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "auth" });
    },
  });
}
