import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
  LegacyCard,
  DataTable,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppQuery } from "../hooks";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: statsError
  } = useAppQuery({
    url: "/api/stats",
  });

  const rows = [
    ['Total Images Processed', stats?.totalImages || '0'],
    ['Images Rejected', stats?.rejectedImages || '0'],
    ['Storage Saved', stats?.storageSaved || '0 MB'],
    ['Average Image Size', stats?.averageSize || '0 MB'],
  ];

  return (
    <Page>
      <TitleBar title="Image Size Restrictor" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <Stack distribution="equalSpacing" alignment="center">
                <TextContainer spacing="loose">
                  <Text variant="headingMd" as="h2">
                    Image Size Management
                  </Text>
                  <p>
                    Control and optimize your store's image sizes to improve performance and SEO.
                  </p>
                </TextContainer>
                <Button primary onClick={() => navigate("/settings")}>
                  Configure Settings
                </Button>
              </Stack>
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <LegacyCard title="Statistics">
            <DataTable
              columnContentTypes={[
                'text',
                'text',
              ]}
              headings={[
                'Metric',
                'Value',
              ]}
              rows={rows}
              loading={isLoadingStats}
            />
          </LegacyCard>
        </Layout.Section>

        <Layout.Section secondary>
          <Card title="Quick Tips">
            <Card.Section>
              <TextContainer spacing="loose">
                <Text as="h3" variant="headingSm">
                  Recommended Image Sizes
                </Text>
                <ul>
                  <li>Product Images: Max 2048px, Min 800px</li>
                  <li>Thumbnails: Max 800px, Min 400px</li>
                  <li>Banners: Max 2048px, Min 1200px</li>
                </ul>
                <Text as="h3" variant="headingSm">
                  Best Practices
                </Text>
                <ul>
                  <li>Use JPG for photos</li>
                  <li>Use PNG for logos and icons</li>
                  <li>Keep file sizes under 2MB</li>
                </ul>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}