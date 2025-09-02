import shopify from "../shopify.js";
import sharp from "sharp";
import axios from "axios";
import { getSettings } from "../settings-handler.js";

export async function validateImage(imageUrl, session) {
  // Get current settings
  const settings = await getSettings(session);
  try {
    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // Check file size
    const sizeInKB = buffer.length / 1024;
    const sizeInMB = sizeInKB / 1024;
    
    if (sizeInKB < settings.minSizeKB) {
      return {
        valid: false,
        error: `Image size (${sizeInKB.toFixed(2)}KB) is below minimum allowed size of ${settings.minSizeKB}KB`
      };
    }
    
    if (sizeInMB > settings.maxSizeMB) {
      return {
        valid: false,
        error: `Image size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size of ${settings.maxSizeMB}MB`
      };
    }

    // Check dimensions using sharp
    const metadata = await sharp(buffer).metadata();
    if (metadata.width > settings.maxDimension || metadata.height > settings.maxDimension) {
      return {
        valid: false,
        error: `Image dimensions (${metadata.width}x${metadata.height}) exceed maximum allowed dimension of ${settings.maxDimension}px`
      };
    }

    if (metadata.width < settings.minDimension || metadata.height < settings.minDimension) {
      return {
        valid: false,
        error: `Image dimensions (${metadata.width}x${metadata.height}) are below minimum required dimension of ${settings.minDimension}px`
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate image: ${error.message}`
    };
  }
}

export async function imageValidationMiddleware(req, res, next) {
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Rest({
    session,
    apiVersion: shopify.api.LATEST_API_VERSION
  });

  // Only process POST/PUT requests to products
  if (!['POST', 'PUT'].includes(req.method) || !req.path.includes('/products')) {
    return next();
  }

  try {
    const body = req.body;
    if (body.product && body.product.images) {
      for (const image of body.product.images) {
        if (image.src) {
          const validationResult = await validateImage(image.src, session);
          if (!validationResult.valid) {
            return res.status(400).json({
              error: validationResult.error
            });
          }
        }
      }
    }
    next();
  } catch (error) {
    res.status(500).json({
      error: `Image validation failed: ${error.message}`
    });
  }
}