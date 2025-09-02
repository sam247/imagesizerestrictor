// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import crypto from "crypto";
import { logger } from "./utils/logger.js";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import ProductWebhookHandlers from "./webhooks/product.js";
import { imageValidationMiddleware } from "./middleware/imageValidation.js";
import { getSettings, updateSettings } from "./settings-handler.js";
import { getStats, updateStats } from "./stats-handler.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, (req, res, next) => {
  logger.info(`Auth begin: ${req.url}`);
  return shopify.auth.begin()(req, res, next);
});

app.get(
  shopify.config.auth.callbackPath,
  (req, res, next) => {
    logger.info(`Auth callback: ${req.url}`);
    return shopify.auth.callback()(req, res, next);
  },
  (req, res, next) => {
    logger.info('Redirecting after auth');
    return shopify.redirectToShopifyOrAppRoot()(req, res, next);
  }
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: { ...PrivacyWebhookHandlers, ...ProductWebhookHandlers } })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// Add image validation middleware for product endpoints
app.use("/api/products", imageValidationMiddleware);

// Settings endpoints
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await getSettings(res.locals.shopify.session);
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const settings = await updateSettings(res.locals.shopify.session, req.body);
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats endpoints
app.get("/api/stats", async (_req, res) => {
  try {
    const stats = await getStats(res.locals.shopify.session);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

// Add request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

app.use(shopify.cspHeaders());

// Serve static files
app.use(serveStatic(STATIC_PATH, { index: false }));

// Add request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

app.use("/*", shopify.ensureInstalledOnShop(), async (req, res, _next) => {
  logger.info(`Catch-all route hit: ${req.url}`);
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

// Error handling middleware should be last
import { errorHandler } from "./middleware/errorHandler.js";
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
