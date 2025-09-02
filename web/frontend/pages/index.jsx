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

  const {
    data: recentImages,
    isLoading: isLoadingImages,
    isError: imagesError
  } = useAppQuery({
    url: "/api/recent-images",
  });

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <Stack distribution="equalSpacing" alignment="center">
                <TextContainer spacing="loose">
                  <Text variant="headingMd" as="h2">
                    Welcome to Image Size Restrictor
                  </Text>
                  <p>
                    Monitor and manage your store's image optimization settings.
                  </p>
                </TextContainer>
                <ButtonGroup>
                  <Button onClick={() => navigate("/analytics")}>
                    View Analytics
                  </Button>
                  <Button primary onClick={() => navigate("/settings")}>
                    Configure Settings
                  </Button>
                </ButtonGroup>
              </Stack>
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card title="Quick Stats">
            <Card.Section>
              {isLoadingStats ? (
                <SkeletonBodyText lines={4} />
              ) : statsError ? (
                <Banner status="critical">
                  There was an error loading the statistics.
                </Banner>
              ) : (
                <Stack vertical spacing="extraTight">
                  <Text as="h3" variant="headingSm">
                    Images Processed: {stats?.totalImages || '0'}
                  </Text>
                  <Text as="h3" variant="headingSm">
                    Storage Saved: {stats?.storageSaved || '0 MB'}
                  </Text>
                  <Text as="h3" variant="headingSm">
                    Average Size: {stats?.averageSize || '0 MB'}
                  </Text>
                </Stack>
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card title="Recent Activity">
            <Card.Section>
              {isLoadingImages ? (
                <SkeletonBodyText lines={4} />
              ) : imagesError ? (
                <Banner status="critical">
                  There was an error loading recent activity.
                </Banner>
              ) : (
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                  ]}
                  headings={[
                    'Image',
                    'Status',
                    'Size',
                  ]}
                  rows={[
                    ['product-1.jpg', 'Optimized', '1.2 MB'],
                    ['banner.png', 'Rejected', '5.5 MB'],
                    ['logo.png', 'Optimized', '0.5 MB'],
                  ]}
                />
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Quick Tips">
            <Card.Section>
              <Grid>
                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3}}>
                  <TextContainer spacing="tight">
                    <Text as="h3" variant="headingSm">
                      Product Images
                    </Text>
                    <Text as="p">Max: 2048px</Text>
                    <Text as="p">Min: 800px</Text>
                  </TextContainer>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3}}>
                  <TextContainer spacing="tight">
                    <Text as="h3" variant="headingSm">
                      Thumbnails
                    </Text>
                    <Text as="p">Max: 800px</Text>
                    <Text as="p">Min: 400px</Text>
                  </TextContainer>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3}}>
                  <TextContainer spacing="tight">
                    <Text as="h3" variant="headingSm">
                      File Types
                    </Text>
                    <Text as="p">JPG for photos</Text>
                    <Text as="p">PNG for logos</Text>
                  </TextContainer>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3}}>
                  <TextContainer spacing="tight">
                    <Text as="h3" variant="headingSm">
                      Best Practices
                    </Text>
                    <Text as="p">Optimize before upload</Text>
                    <Text as="p">Keep under 2MB</Text>
                  </TextContainer>
                </Grid.Cell>
              </Grid>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}