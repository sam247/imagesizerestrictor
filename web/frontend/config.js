export const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || "";
export const API_URL = process.env.NODE_ENV === "production" 
  ? "https://imagesizerestrictor.onrender.com"
  : "http://localhost:8081";
