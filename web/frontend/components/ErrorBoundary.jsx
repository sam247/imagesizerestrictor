import React from 'react';
import { Banner, Layout, Page } from "@shopify/polaris";
import { logger } from '../utils/logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log the error
    logger.error('React Error Boundary caught an error', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Page narrowWidth>
          <Layout>
            <Layout.Section>
              <Banner
                title="Something went wrong"
                status="critical"
              >
                <p>The app encountered an error. Please try refreshing the page.</p>
                {process.env.NODE_ENV === 'development' && (
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                )}
              </Banner>
            </Layout.Section>
          </Layout>
        </Page>
      );
    }

    return this.props.children;
  }
}
