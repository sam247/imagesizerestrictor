import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Routes from "./Routes";

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
              <Routes pages={pages} />
            </QueryProvider>
          </AppBridgeProvider>
        </BrowserRouter>
      </PolarisProvider>
    </ErrorBoundary>
  );
}