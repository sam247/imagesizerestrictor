import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { createApp } from "@shopify/app-bridge";
import { AppBridgeProvider as ShopifyBridgeProvider } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";

export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const apiKey = process.env.SHOPIFY_API_KEY;
  const host = urlParams.get("host");

  const config = useMemo(
    () => ({
      host,
      apiKey,
      forceRedirect: true
    }),
    [host, apiKey]
  );

  if (!process.env.SHOPIFY_API_KEY || !host) {
    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <Banner title="Missing Shopify API key or host" status="critical">
              Your app is running without the SHOPIFY_API_KEY environment
              variable or host parameter. Make sure to configure your app properly.
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return <ShopifyBridgeProvider config={config}>{children}</ShopifyBridgeProvider>;
}