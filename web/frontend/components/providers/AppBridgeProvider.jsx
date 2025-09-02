import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { createApp } from "@shopify/app-bridge";
import { useAppBridge, useNavigate } from "@shopify/app-bridge-react";
import { SHOPIFY_API_KEY } from "../../utils/config";
import { Banner, Layout, Page } from "@shopify/polaris";

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridge that provides the following capabilities:
 *
 * 1. Ensures that navigating inside the app updates the host URL.
 * 2. Configures the App Bridge connection
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // The host may be present initially, but later removed by navigation.
  const urlParams = new URLSearchParams(location.search);
  const host = urlParams.get("host");
  
  // Initialize the app only once
  const app = useMemo(() => {
    if (!host || !SHOPIFY_API_KEY) return null;
    
    return createApp({
      apiKey: SHOPIFY_API_KEY,
      host: host,
      forceRedirect: true
    });
  }, [host]);

  if (!SHOPIFY_API_KEY || !host) {
    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <Banner title="Missing Shopify API key or host" status="critical">
              Your app is running without the SHOPIFY_API_KEY environment
              variable or host parameter. Make sure to configure your
              app properly.
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return children;
}