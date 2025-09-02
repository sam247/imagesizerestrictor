import {
  Card,
  Page,
  Layout,
  TextContainer,
  Stack,
  Text,
  DataTable,
  Button,
  ButtonGroup,
  Grid,
  Banner,
  SkeletonBodyText
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppQuery } from "../hooks";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Image Size Restrictor" />
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <Banner status="info" title="Debug Info">
                <pre>
                  {JSON.stringify({
                    pathname: window.location.pathname,
                    search: window.location.search,
                    host: new URLSearchParams(window.location.search).get('host'),
                    shop: new URLSearchParams(window.location.search).get('shop'),
                  }, null, 2)}
                </pre>
              </Banner>
              <Stack vertical>
                <TextContainer>
                  <Text variant="headingMd" as="h2">
                    Welcome to Image Size Restrictor
                  </Text>
                  <p>
                    This is a simplified test page to debug loading issues.
                  </p>
                </TextContainer>
                <ButtonGroup>
                  <Button onClick={() => navigate("/settings")}>
                    Go to Settings
                  </Button>
                </ButtonGroup>
              </Stack>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}