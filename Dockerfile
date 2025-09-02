FROM node:20.10.0-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY package*.json ./
COPY web/package*.json ./web/
COPY web/frontend/package*.json ./web/frontend/

# Install dependencies
RUN npm install
RUN cd web && npm install
RUN cd web/frontend && npm install

# Copy the rest of the application
COPY . .

# Build the frontend
WORKDIR /app/web/frontend
RUN npm run build

# Start the application
WORKDIR /app/web
ENV NODE_ENV=production
CMD ["npm", "start"]
