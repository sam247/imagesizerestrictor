// ensureShopParam middleware: redirects initial requests lacking ?shop=
import { logger } from "../utils/logger.js";

export default function ensureShopParam(req, res, next) {
  // skip API and static paths
  if (req.url.startsWith('/api') || req.url.startsWith('/static')) {
    return next();
  }

  const { shop } = req.query;
  if (shop) return next();

  // Try decode host param
  if (!shop) {
    const hostParam = req.query.host;
    if (hostParam) {
      try {
        const decoded = Buffer.from(hostParam, 'base64').toString('utf-8');
        // decoded like "admin.shopify.com/store/<shop-domain>"
        const match = decoded.match(/store\/(.*)$/);
        if (match) {
          const derivedShop = `${match[1]}.myshopify.com`;
          const redirect = `/api/auth?shop=${derivedShop}`;
          logger.info(`ensureShopParam redirect using host param to ${redirect}`);
          return res.redirect(302, redirect);
        }
      } catch (err) {
        logger.error(`Failed to decode host param: ${err.message}`);
      }
    }
  }

  // Shopify sends X-Shopify-Shop-Domain on the first load inside admin
  const shopHeader = req.get('x-shopify-shop-domain');
  if (shopHeader) {
    const redirect = `/api/auth?shop=${shopHeader}`;
    logger.info(`ensureShopParam redirecting to ${redirect}`);
    return res.redirect(302, redirect);
  }

  logger.info('ensureShopParam could not determine shop');
  return res.status(400).send('Shop parameter missing');
}
