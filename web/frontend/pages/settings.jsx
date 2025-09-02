import { useState, useCallback, useEffect } from "react";
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
  RangeSlider,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";

export default function SettingsPage() {
  const fetch = useAuthenticatedFetch();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    minSizeKB: 100,
    maxSizeMB: 2,
    maxDimension: 2048,
    minDimension: 800,
    compressionQuality: "high",
    autoOptimize: true,
    sizePreset: "custom"
  });

  const sizePresets = [
    { label: "Small (max 500KB)", value: "small" },
    { label: "Medium (max 1MB)", value: "medium" },
    { label: "Large (max 2MB)", value: "large" },
    { label: "Extra Large (max 5MB)", value: "xlarge" },
    { label: "Custom", value: "custom" }
  ];

  const qualityOptions = [
    { label: "Low (60%)", value: "low" },
    { label: "Medium (75%)", value: "medium" },
    { label: "High (85%)", value: "high" },
    { label: "Maximum (100%)", value: "maximum" },
  ];

  const handleSizePresetChange = useCallback((value) => {
    setSettings(prev => {
      const newSettings = { ...prev, sizePreset: value };
      switch (value) {
        case "small":
          newSettings.minSizeKB = 50;
          newSettings.maxSizeMB = 0.5;
          break;
        case "medium":
          newSettings.minSizeKB = 100;
          newSettings.maxSizeMB = 1;
          break;
        case "large":
          newSettings.minSizeKB = 200;
          newSettings.maxSizeMB = 2;
          break;
        case "xlarge":
          newSettings.minSizeKB = 500;
          newSettings.maxSizeMB = 5;
          break;
      }
      return newSettings;
    });
  }, []);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, [fetch]);

  const handleSubmit = useCallback(async () => {
    // Validate settings
    if (settings.minSizeKB >= settings.maxSizeMB * 1024) {
      setToast({
        content: "Minimum size must be less than maximum size",
        error: true
      });
      return;
    }

    if (settings.minDimension >= settings.maxDimension) {
      setToast({
        content: "Minimum dimension must be less than maximum dimension",
        error: true
      });
      return;
    }

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
          title="File Size Limits"
          description="Configure minimum and maximum file sizes for uploaded images."
        >
          <Card sectioned>
            <FormLayout>
              <Select
                label="Size Preset"
                options={sizePresets}
                value={settings.sizePreset}
                onChange={handleSizePresetChange}
                helpText="Choose a preset or select 'Custom' for manual configuration"
              />

              {settings.sizePreset === "custom" && (
                <>
                  <TextField
                    label="Minimum File Size (KB)"
                    type="number"
                    value={settings.minSizeKB.toString()}
                    onChange={(value) =>
                      setSettings({ ...settings, minSizeKB: parseInt(value, 10) })
                    }
                    helpText="Minimum allowed file size in kilobytes (KB)"
                  />

                  <TextField
                    label="Maximum File Size (MB)"
                    type="number"
                    value={settings.maxSizeMB.toString()}
                    onChange={(value) =>
                      setSettings({ ...settings, maxSizeMB: parseFloat(value) })
                    }
                    helpText="Maximum allowed file size in megabytes (MB)"
                  />
                </>
              )}

              <Banner status="info">
                Current limits: {settings.minSizeKB}KB to {settings.maxSizeMB}MB
              </Banner>
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Image Dimensions"
          description="Configure maximum and minimum image dimensions."
        >
          <Card sectioned>
            <FormLayout>
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
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Optimization Settings"
          description="Configure image optimization and compression settings."
        >
          <Card sectioned>
            <FormLayout>
              <Select
                label="Compression Quality"
                options={qualityOptions}
                value={settings.compressionQuality}
                onChange={(value) =>
                  setSettings({ ...settings, compressionQuality: value })
                }
                helpText="JPEG compression quality (higher = better quality but larger file size)"
              />

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

        <Layout.Section>
          <Stack distribution="trailing">
            <ButtonGroup>
              <Button onClick={() => setSettings({
                minSizeKB: 100,
                maxSizeMB: 2,
                maxDimension: 2048,
                minDimension: 800,
                compressionQuality: "high",
                autoOptimize: true,
                sizePreset: "large"
              })}>
                Reset to Defaults
              </Button>
              <Button primary loading={loading} onClick={handleSubmit}>
                Save Settings
              </Button>
            </ButtonGroup>
          </Stack>
        </Layout.Section>
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