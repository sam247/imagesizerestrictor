// ensureShopParam middleware: redirects initial requests lacking ?shop=
import { logger } from "../utils/logger.js";

export default function ensureShopParam(req, res, next) {
  // skip API and static paths
  if (req.url.startsWith('/api') || req.url.startsWith('/static')) {
    return next();
  }

  const { shop } = req.query;
  if (shop) return next();

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
