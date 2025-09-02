import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-07";
import { join } from "path";

const DB_PATH = join(process.cwd(), "database.sqlite");

// Initialize SQLite session storage
const sessionStorage = new SQLiteSessionStorage(DB_PATH);

const shopify = shopifyApp({
  sessionStorage,
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined, // or use billingConfig if you want to charge merchants
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
});

export default shopify;