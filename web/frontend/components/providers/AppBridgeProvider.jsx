import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Provider } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridge Provider that provides the following capabilities:
 *
 * 1. Ensures that navigating inside the app updates the host URL.
 * 2. Configures the App Bridge Provider
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  // The host may be present initially, but later removed by navigation.
  // By caching this in a ref, we ensure that the host is available when the configured
  // config object needs it.
  const host = urlParams.get("host");
  const apiKey = process.env.SHOPIFY_API_KEY;

  const config = useMemo(
    () => ({
      host,
      apiKey: apiKey,
      forceRedirect: true,
    }),
    [host]
  );

  if (!apiKey || !host) {
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

  return <Provider config={config}>{children}</Provider>;
}