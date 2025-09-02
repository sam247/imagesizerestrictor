# Use the official Node.js 20 image
FROM node:20.10.0-alpine

# Set build arguments
ARG SHOPIFY_API_KEY

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8081
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY web/package*.json ./web/
COPY web/frontend/package*.json ./web/frontend/

# Install dependencies
RUN npm ci --no-audit
RUN cd web && npm ci --no-audit
RUN cd web/frontend && npm ci --no-audit

# Copy the rest of the application
COPY . .

# Build the frontend
WORKDIR /app/web/frontend
ENV VITE_SHOPIFY_API_KEY=${SHOPIFY_API_KEY}
RUN npm run build

# Start the application
WORKDIR /app/web
CMD ["npm", "start"]