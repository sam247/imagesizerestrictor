import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  Range
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";

export default function SettingsPage() {
  const fetch = useAuthenticatedFetch();
  const [settings, setSettings] = useState({
    maxSizeMB: 2,
    maxDimension: 2048,
    minDimension: 200,
    compressionQuality: 80
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = useCallback(async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Settings updated successfully",
        });
      } else {
        setStatus({
          type: "error",
          message: "Failed to update settings",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: `Error: ${error.message}`,
      });
    }
  }, [settings, fetch]);

  return (
    <Page title="Image Validation Settings">
      <Layout>
        {status.message && (
          <Layout.Section>
            <Banner
              title={status.type === "success" ? "Success" : "Error"}
              status={status.type}
              onDismiss={() => setStatus({ type: "", message: "" })}
            >
              <p>{status.message}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
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

              <Range
                label="Compression Quality"
                value={settings.compressionQuality}
                onChange={(value) =>
                  setSettings({ ...settings, compressionQuality: value })
                }
                min={0}
                max={100}
                output
                helpText="JPEG compression quality (higher = better quality but larger file size)"
              />

              <Button primary onClick={handleSubmit}>
                Save Settings
              </Button>
            </FormLayout>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card sectioned>
            <Text as="h2" variant="headingMd">
              About Image Validation
            </Text>
            <Text as="p" variant="bodyMd">
              These settings control how product images are validated when uploaded to your store.
              Proper image optimization can improve your store's performance and SEO ranking.
            </Text>
            <br />
            <Text as="p" variant="bodyMd">
              • File size limits help reduce page load times<br />
              • Dimension limits ensure consistent image quality<br />
              • Compression quality balances size and visual quality
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
