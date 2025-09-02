import { DeliveryMethod } from "@shopify/shopify-api";
import { validateImage } from "../middleware/imageValidation.js";

export default {
  PRODUCTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks/products/create",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Product created webhook received", { topic, shop, webhookId });
      
      if (payload.images && payload.images.length > 0) {
        for (const image of payload.images) {
          try {
            const validationResult = await validateImage(image.src);
            if (!validationResult.valid) {
              console.error("Image validation failed:", validationResult.error);
              // TODO: Implement notification system to alert merchant
            }
          } catch (error) {
            console.error("Error validating image:", error);
          }
        }
      }
    },
  },
  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks/products/update",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Product updated webhook received", { topic, shop, webhookId });
      
      if (payload.images && payload.images.length > 0) {
        for (const image of payload.images) {
          try {
            const validationResult = await validateImage(image.src);
            if (!validationResult.valid) {
              console.error("Image validation failed:", validationResult.error);
              // TODO: Implement notification system to alert merchant
            }
          } catch (error) {
            console.error("Error validating image:", error);
          }
        }
      }
    },
  },
};
