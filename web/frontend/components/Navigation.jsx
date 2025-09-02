import { Navigation } from "@shopify/polaris";
import { HomeIcon, SettingsIcon, AnalyticsIcon } from "@shopify/polaris-icons";
import { useLocation, useNavigate } from "react-router-dom";

export function AppNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = [
    {
      label: "Dashboard",
      icon: HomeIcon,
      url: "/",
      selected: location.pathname === "/"
    },
    {
      label: "Analytics",
      icon: AnalyticsIcon,
      url: "/analytics",
      selected: location.pathname === "/analytics"
    },
    {
      label: "Settings",
      icon: SettingsIcon,
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
