import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Routes from "./Routes";
import { Frame } from "@shopify/polaris";
import { AppNavigation } from "./components/Navigation";

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
              <Frame navigation={<AppNavigation />}>
                <Routes pages={pages} />
              </Frame>
            </QueryProvider>
          </AppBridgeProvider>
        </BrowserRouter>
      </PolarisProvider>
    </ErrorBoundary>
  );
}