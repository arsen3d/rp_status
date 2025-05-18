# Base Node image
FROM app-registry:5000/node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies using pnpm
COPY rp-dashboard/package.json rp-dashboard/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application
COPY rp-dashboard/ ./

# Build the application
RUN pnpm build

# Production image
FROM nginx:alpine

# Copy built files to Nginx serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]