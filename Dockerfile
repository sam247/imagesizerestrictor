# Use the official Node.js 20 image
FROM node:20.10.0-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8081

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY web/package*.json ./web/
COPY web/frontend/package*.json ./web/frontend/

# Install dependencies
RUN npm install
RUN cd web && npm install
RUN cd frontend && npm install

# Copy the rest of the application
COPY . .

# Build the frontend
WORKDIR /app/web/frontend
ENV VITE_SHOPIFY_API_KEY=${SHOPIFY_API_KEY}
RUN npm run build

# Start the application
WORKDIR /app/web
CMD ["npm", "start"]