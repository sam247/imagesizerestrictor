import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import { logger } from "./utils/logger.js";
import PrivacyWebhookHandlers from "./privacy.js";
import ProductWebhookHandlers from "./webhooks/product.js";
import ensureShopParam from "./middleware/ensureShopParam.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());

app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  (_req, res) => {
    // Redirect to app with shop parameter
    const shop = res.locals.shopify.session.shop;
    const host = res.locals.shopify.session.host;
    const redirectUrl = `/?shop=${shop}&host=${host}`;
    logger.info(`Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
  }
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: { ...PrivacyWebhookHandlers, ...ProductWebhookHandlers } })
);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

// ensure ?shop= for first load; skipped when session already present
app.use(ensureShopParam);

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  try {
    const countData = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });
    res.status(200).json(countData);
  } catch (error) {
    logger.error(`Failed to get product count: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    logger.info(`No shop found in request: ${req.url}`);
    return res.status(400).send("No shop provided");
  }

  logger.info(`Serving frontend for shop: ${shop}`);
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace(/%SHOPIFY_API_KEY%/g, process.env.SHOPIFY_API_KEY || "440a416d0f65d3a6379fd29fbfd1f459")
    );
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});