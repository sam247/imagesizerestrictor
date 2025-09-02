import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  // Redirect to Shopify admin if we're not embedded and there's no host
  useMemo(() => {
    if (!currentHost && !window.navigator.userAgent.match(/Shopify Mobile/i)) {
      const shopifyUrl = `https://admin.shopify.com/store`;
      window.location.href = shopifyUrl;
    }
  }, [currentHost]);

  const config = useMemo(
    () => ({
      host: currentHost,
      apiKey: apiKey,
      forceRedirect: true
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
              {process.env.NODE_ENV === 'development' && (
                <pre>
                  {JSON.stringify({ apiKey: !!apiKey, host: currentHost }, null, 2)}
                </pre>
              )}
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Provider config={config}>
      {children}
    </Provider>
  );
}