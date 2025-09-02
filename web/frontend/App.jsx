import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Routes from "./Routes";
import { Frame, Banner } from "@shopify/polaris";

import { QueryProvider, PolarisProvider } from "./components";
import { AppBridgeProvider } from "./components/providers/AppBridgeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  return (
    <ErrorBoundary>
      <PolarisProvider>
        <BrowserRouter>
          <AppBridgeProvider>
            <QueryProvider>
              <Frame>
                <Banner status="info" title="App Loading State">
                  <p>Current route: {window.location.pathname}</p>
                  <p>Search params: {window.location.search}</p>
                </Banner>
                <Routes pages={pages} />
              </Frame>
            </QueryProvider>
          </AppBridgeProvider>
        </BrowserRouter>
      </PolarisProvider>
    </ErrorBoundary>
  );
}