import {
  Page,
  Layout,
  Card,
  DataTable,
  Text,
  SkeletonBodyText,
  Banner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery } from "../hooks";

export default function AnalyticsPage() {
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
      <TitleBar title="Analytics" />
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <Text variant="headingMd" as="h2">
                Image Processing Statistics
              </Text>
              {isLoadingStats ? (
                <SkeletonBodyText lines={4} />
              ) : statsError ? (
                <Banner status="critical">
                  There was an error loading the statistics.
                </Banner>
              ) : (
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
                />
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Recent Activity">
            <Card.Section>
              {isLoadingStats ? (
                <SkeletonBodyText lines={5} />
              ) : (
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                  ]}
                  headings={[
                    'Date',
                    'Action',
                    'Result',
                  ]}
                  rows={[
                    ['Today', 'Image Upload', 'Success'],
                    ['Yesterday', 'Batch Process', 'Success'],
                    ['2 days ago', 'Image Upload', 'Rejected'],
                  ]}
                />
              )}
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
