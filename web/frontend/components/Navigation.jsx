import { Navigation } from "@shopify/polaris";
import {
  HomeMajor,
  SettingsMajor,
  AnalyticsMajor
} from "@shopify/polaris-icons";
import { useLocation, useNavigate } from "react-router-dom";

export function AppNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = [
    {
      label: "Dashboard",
      icon: HomeMajor,
      url: "/",
      selected: location.pathname === "/"
    },
    {
      label: "Analytics",
      icon: AnalyticsMajor,
      url: "/analytics",
      selected: location.pathname === "/analytics"
    },
    {
      label: "Settings",
      icon: SettingsMajor,
      url: "/settings",
      selected: location.pathname === "/settings"
    }
  ];

  return (
    <Navigation location="/">
      <Navigation.Section
        items={navigationItems.map(item => ({
          ...item,
          onClick: () => navigate(item.url)
        }))}
      />
    </Navigation>
  );
}
