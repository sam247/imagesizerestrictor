import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createApp } from "@shopify/app-bridge";
import { Provider } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";
import { logger } from "../../utils/logger.js";

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridge Provider that provides the following capabilities:
 *
 * 1. Ensures that navigating inside the app updates the host URL.
 * 2. Configures the App Bridge Provider
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get API key from window to ensure it's available after build
  const apiKey = window.SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY;
  
  // The host may be present initially, but later removed by navigation.
  const urlParams = new URLSearchParams(location.search);
  const host = urlParams.get("host");

  // For local development, we grab the host from the environment
  const devHost = process.env.NODE_ENV === "development" ? process.env.HOST : null;
  const currentHost = host || devHost;

  const config = useMemo(
    () => ({
      host: currentHost,
      apiKey: apiKey,
      forceRedirect: true,
      isEmbeddedApp: true,
      // Add required OAuth configuration
      hostScheme: "https",
      scopes: ["write_products", "write_files", "read_files"]
    }),
    [currentHost, apiKey]
  );

  // Log configuration issues in development
  if (process.env.NODE_ENV === 'development') {
    if (!apiKey) {
      logger.error('Missing Shopify API key', { env: process.env });
    }
    if (!currentHost) {
      logger.error('Missing host parameter', { search: location.search });
    }
  }

  // Always show debug info in a banner
  const debugInfo = {
    apiKey: !!apiKey,
    host: currentHost,
    location: location.pathname + location.search,
    env: process.env.NODE_ENV,
    shopifyApiKey: window.SHOPIFY_API_KEY,
  };

  if (!apiKey || !currentHost) {
    const message = !apiKey ? "Missing Shopify API key" : "Missing host parameter";
    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <Banner
              title={message}
              status="critical"
            >
              <p>Your app is running without the required configuration. Check your environment variables and app setup.</p>
              <pre>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Show debug info even when configured
  return (
    <>
      <Banner title="Debug Info" status="info">
        <pre>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </Banner>
      <Provider config={config}>
        {children}
      </Provider>
    </>
  );

  return (
    <Provider config={config}>
      {children}
    </Provider>
  );
}