import { useQuery } from "react-query";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export function useAppQuery(options) {
  const authenticatedFetch = useAuthenticatedFetch();
  const { url, fetchInit = {} } = options;

  return useQuery(
    url,
    async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    },
    {
      refetchOnReconnect: false,
      ...options,
    }
  );
}
