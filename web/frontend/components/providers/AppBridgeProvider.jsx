import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Provider } from "@shopify/app-bridge-react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";

export function AppBridgeProvider({ children }) {
  const location = useLocation();

  const history = useMemo(
    () => ({
      replace: (path) => {
        window.location.assign(path);
      },
    }),
    []
  );

  const routerConfig = useMemo(
    () => ({ history, location }),
    [history, location]
  );

  const appBridgeConfig = useMemo(
    () => ({
      host: new URLSearchParams(location.search).get("host"),
      apiKey: process.env.SHOPIFY_API_KEY,
      forceRedirect: true,
    }),
    [location.search]
  );

  if (!process.env.SHOPIFY_API_KEY || !appBridgeConfig.host) {
    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <Banner title="Missing Shopify API key" status="critical">
              Your app is running without the SHOPIFY_API_KEY environment variable.
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Provider config={appBridgeConfig} router={routerConfig}>
      {children}
    </Provider>
  );
}
