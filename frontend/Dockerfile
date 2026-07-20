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

# Set up directory permissions so Nginx can run as non-root user
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Switch to the non-root user
USER nginx

# Expose non-privileged HTTP port
EXPOSE 8080

# Health check to ensure frontend is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
