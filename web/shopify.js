import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-07";
import { join } from "path";
import { logger } from "./utils/logger.js";

const DB_PATH = join(process.cwd(), "database.sqlite");
logger.info(`SQLite DB Path: ${DB_PATH}`);

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY || "440a416d0f65d3a6379fd29fbfd1f459",
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    apiVersion: LATEST_API_VERSION,
    hostName: process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, '') || "imagesizerestrictor.onrender.com",
    hostScheme: "https",
    isEmbeddedApp: true,
    scopes: ["write_products", "write_files", "read_files"],
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
});

export default shopify;