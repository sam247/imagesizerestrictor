import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-07";
import { logger } from "./utils/logger.js";

const DB_PATH = `${process.cwd()}/database.sqlite`;
logger.info(`SQLite DB Path: ${DB_PATH}`);

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    hostName: process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, '') || "imagesizerestrictor.onrender.com",
    hostScheme: "https",
    isEmbeddedApp: true,
    apiKey: process.env.SHOPIFY_API_KEY,
    scopes: ["write_products", "write_files", "read_files"],
    logger: {
      level: 0 // Enable all logging
    },
    billing: undefined, // Disable billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
    checkBilling: false,
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
  future: {
    customerAddressDefaultFix: true,
    lineItemBilling: true,
    unstable_managedPricingSupport: true,
  }
});

export default shopify;