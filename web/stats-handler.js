import shopify from "./shopify.js";

const STATS_METAFIELD_NAMESPACE = "image_validator_stats";
const STATS_METAFIELD_KEY = "stats";

export async function getStats(session) {
  const client = new shopify.api.clients.Rest({
    session,
    apiVersion: shopify.api.LATEST_API_VERSION
  });
  
  try {
    const response = await client.get({
      path: 'metafields',
      query: {
        namespace: STATS_METAFIELD_NAMESPACE,
        key: STATS_METAFIELD_KEY
      }
    });

    const metafield = response.body.metafields.find(
      m => m.namespace === STATS_METAFIELD_NAMESPACE && m.key === STATS_METAFIELD_KEY
    );

    if (metafield) {
      return JSON.parse(metafield.value);
    }

    // Return default stats if none exist
    return {
      totalImages: 0,
      rejectedImages: 0,
      storageSaved: "0",
      averageSize: "0"
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

export async function updateStats(session, stats) {
  const client = new shopify.api.clients.Rest({
    session,
    apiVersion: shopify.api.LATEST_API_VERSION
  });
  
  try {
    await client.post({
      path: 'metafields',
      data: {
        metafield: {
          namespace: STATS_METAFIELD_NAMESPACE,
          key: STATS_METAFIELD_KEY,
          value: JSON.stringify(stats),
          type: 'json'
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
}
