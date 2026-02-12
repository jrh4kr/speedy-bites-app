# Production multi-stage Dockerfile for Speedy Bites
# Stage 1: Build the Vite React frontend
# Stage 2: Run Express API + serve static frontend

# ---- Build frontend ----
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
COPY bun.lockb .
RUN npm ci --silent
COPY . .
RUN npm run build

# ---- Production ----
FROM node:18-alpine AS production
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --production --silent

# Copy server code
COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Create upload directories
RUN mkdir -p server/uploads/products server/uploads/categories server/uploads/temp

# Expose the API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the Express server (which also serves the frontend)
CMD ["node", "server/index.js"]
