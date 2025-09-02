import { authenticatedFetch } from "@shopify/app-bridge/utilities";
import { useAppBridge } from "@shopify/app-bridge-react";

export function useAuthenticatedFetch() {
  const app = useAppBridge();
  return authenticatedFetch(app);
}
