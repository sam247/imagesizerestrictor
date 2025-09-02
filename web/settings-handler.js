import { Shopify } from "@shopify/shopify-api";

const METAFIELD_NAMESPACE = "image_validator";
const METAFIELD_KEY = "settings";

export async function getSettings(session) {
  const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
  
  try {
    const response = await client.get({
      path: 'metafields',
      query: {
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_KEY
      }
    });

    const metafield = response.body.metafields.find(
      m => m.namespace === METAFIELD_NAMESPACE && m.key === METAFIELD_KEY
    );

    if (metafield) {
      return JSON.parse(metafield.value);
    }

    // Return default settings if none exist
    return {
      maxSizeMB: 2,
      maxDimension: 2048,
      minDimension: 200,
      compressionQuality: 80
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
}

export async function updateSettings(session, settings) {
  const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
  
  try {
    await client.post({
      path: 'metafields',
      data: {
        metafield: {
          namespace: METAFIELD_NAMESPACE,
          key: METAFIELD_KEY,
          value: JSON.stringify(settings),
          type: 'json'
        }
      }
    });

    return settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}
