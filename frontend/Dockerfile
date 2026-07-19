# ==========================================
# Stage 1: Build React application
# ==========================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install npm dependencies
RUN npm ci

# Copy all source files
COPY . .

# Inject build time variables for Vite bundle compile
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build production bundles
RUN npm run build

# ==========================================
# Stage 2: Serve React build files with Nginx
# ==========================================
FROM nginx:stable-alpine

# Copy built artifacts from the build stage to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
