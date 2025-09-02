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

logger.info(`Static path: ${STATIC_PATH}`);
logger.info(`Current working directory: ${process.cwd()}`);
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);

const app = express();

// Enable query string parsing
app.use(express.urlencoded({ extended: true }));

// Set up Shopify authentication and webhook handling
// Auth endpoints
app.get("/api/auth", async (req, res, next) => {
  logger.info(`Auth begin: ${req.url}`);
  
  if (!req.query.shop) {
    logger.error("No shop provided for auth");
    res.status(400).send("No shop provided");
    return;
  }

  logger.info(`Starting auth for shop: ${req.query.shop}`);
  return shopify.auth.begin()(req, res, next);
});

app.get("/api/auth/callback", async (req, res, next) => {
  logger.info(`Auth callback: ${req.url}`);
  
  try {
    const { shop } = req.query;
    logger.info(`Processing callback for shop: ${shop}`);

    // Complete the OAuth process
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    logger.info(`Auth callback session created: ${!!session}`);

    // Check if we need to do online auth
    const isOnlineAccessRequired = session.isOnline === false;
    
    if (isOnlineAccessRequired) {
      logger.info(`Starting online auth for: ${shop}`);
      return shopify.auth.begin({
        shop,
        isOnline: true,
        callbackPath: "/api/auth/callback",
      })(req, res, next);
    }

    // We have online access, redirect to app
    logger.info(`Auth complete, redirecting to app for: ${shop}`);
    return shopify.auth.redirectToShopifyOrAppRoot()(req, res, next);
  } catch (error) {
    logger.error("Auth callback error:", error);
    res.status(500).send("Authentication failed");
  }
});
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: { ...PrivacyWebhookHandlers, ...ProductWebhookHandlers } })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// Add session validation logging
app.use("/api/*", (req, res, next) => {
  logger.info(`Validating session for: ${req.url}`);
  logger.info(`Session: ${JSON.stringify(req.session, null, 2)}`);
  return shopify.validateAuthenticatedSession()(req, res, next);
});

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

// Auth endpoints
app.get("/api/auth", async (req, res, next) => {
  logger.info(`Auth begin: ${req.url}`);
  return shopify.auth.begin()(req, res, next);
});

app.get("/api/auth/callback", async (req, res) => {
  try {
    logger.info(`Auth callback received: ${req.url}`);
    const { shop } = req.query;

    // Complete the OAuth process
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    logger.info(`Auth callback completed for ${shop}`, { callbackResponse });

    // Perform post-authentication redirect
    const redirectUrl = await shopify.auth.getEmbeddedAppUrl({
      rawRequest: req,
      rawResponse: res,
    });

    logger.info(`Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error(`Auth callback error: ${error.message}`, { error });
    res.status(500).send("Failed to complete OAuth process");
  }
});

// This route will handle both app installation and rendering
app.use("/*", async (req, res, next) => {
  const shop = req.query.shop;
  const host = req.query.host;
  
  // Skip auth for static assets and API endpoints
  if (req.url.match(/^\/static\//) || req.url.match(/^\/api\//)) {
    logger.info(`Skipping auth for: ${req.url}`);
    return next();
  }

  if (!shop) {
    logger.info(`No shop found in request: ${req.url}`);
    return res.status(400).send("No shop provided");
  }

  logger.info(`Processing request for shop: ${shop}, host: ${host}`);

  // Check if we're on an auth-related path
  if (req.url.match(/^\/api\/auth/)) {
    logger.info(`Allowing auth path: ${req.url}`);
    return next();
  }

  try {
    // First check for offline session
    const offlineId = await shopify.api.session.getOfflineId(shop);
    const offlineSession = await shopify.config.sessionStorage.loadSession(offlineId);

    logger.info(`Offline session check: ${!!offlineSession}`);

    // If no offline session, start OAuth
    if (!offlineSession) {
      logger.info(`No offline session, starting auth for: ${shop}`);
      return shopify.auth.begin({
        shop,
        isOnline: false,
        callbackPath: "/api/auth/callback",
      })(req, res, next);
    }

    // Check for online session
    const sessionId = await shopify.api.session.getCurrentId({
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    logger.info(`Online session check: ${!!sessionId}`);

    if (!sessionId) {
      logger.info(`No online session, starting auth for: ${shop}`);
      return shopify.auth.begin({
        shop,
        isOnline: true,
        callbackPath: "/api/auth/callback",
      })(req, res, next);
    }

    const session = await shopify.config.sessionStorage.loadSession(sessionId);
    if (!session) {
      logger.info(`Online session not found, starting auth for: ${shop}`);
      return shopify.auth.begin({
        shop,
        isOnline: true,
        callbackPath: "/api/auth/callback",
      })(req, res, next);
    }

    // We have a valid session
    logger.info(`Valid session found for: ${shop}`);
    return next();
  } catch (error) {
    logger.error(`Auth error: ${error.message}`, { error });
    return shopify.auth.begin({
      shop,
      isOnline: true,
      callbackPath: "/api/auth/callback",
    })(req, res, next);
  }
}, async (req, res, _next) => {
  logger.info(`Serving frontend for: ${req.url}`);
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
