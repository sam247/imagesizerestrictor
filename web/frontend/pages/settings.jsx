import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Select,
  Banner,
  Stack,
  Text,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";

export default function SettingsPage() {
  const fetch = useAuthenticatedFetch();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maxSizeMB: 2,
    maxDimension: 2048,
    minDimension: 800,
    compressionQuality: "high",
    autoOptimize: true,
  });

  const qualityOptions = [
    { label: "Low (60%)", value: "low" },
    { label: "Medium (75%)", value: "medium" },
    { label: "High (85%)", value: "high" },
    { label: "Maximum (100%)", value: "maximum" },
  ];

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setToast({
          content: "Settings saved successfully",
          error: false,
        });
      } else {
        setToast({
          content: "Failed to save settings",
          error: true,
        });
      }
    } catch (error) {
      setToast({
        content: `Error: ${error.message}`,
        error: true,
      });
    }
    setLoading(false);
  }, [settings, fetch]);

  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.AnnotatedSection
          title="Image Size Restrictions"
          description="Configure maximum and minimum image dimensions and file sizes."
        >
          <Card sectioned>
            <FormLayout>
              <TextField
                label="Maximum File Size (MB)"
                type="number"
                value={settings.maxSizeMB.toString()}
                onChange={(value) =>
                  setSettings({ ...settings, maxSizeMB: parseFloat(value) })
                }
                helpText="Maximum allowed file size in megabytes"
              />

              <TextField
                label="Maximum Dimension (pixels)"
                type="number"
                value={settings.maxDimension.toString()}
                onChange={(value) =>
                  setSettings({ ...settings, maxDimension: parseInt(value, 10) })
                }
                helpText="Maximum allowed width or height in pixels"
              />

              <TextField
                label="Minimum Dimension (pixels)"
                type="number"
                value={settings.minDimension.toString()}
                onChange={(value) =>
                  setSettings({ ...settings, minDimension: parseInt(value, 10) })
                }
                helpText="Minimum required width or height in pixels"
              />

              <Select
                label="Compression Quality"
                options={qualityOptions}
                value={settings.compressionQuality}
                onChange={(value) =>
                  setSettings({ ...settings, compressionQuality: value })
                }
                helpText="JPEG compression quality (higher = better quality but larger file size)"
              />

              <Stack distribution="trailing">
                <Button primary loading={loading} onClick={handleSubmit}>
                  Save Settings
                </Button>
              </Stack>
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Optimization Settings"
          description="Configure automatic image optimization settings."
        >
          <Card sectioned>
            <FormLayout>
              <Select
                label="Auto-Optimize Images"
                options={[
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
                ]}
                value={settings.autoOptimize.toString()}
                onChange={(value) =>
                  setSettings({ ...settings, autoOptimize: value === "true" })
                }
                helpText="Automatically optimize images during upload"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
      {toast && (
        <Toast
          content={toast.content}
          error={toast.error}
          onDismiss={() => setToast(null)}
        />
      )}
    </Page>
  );
}