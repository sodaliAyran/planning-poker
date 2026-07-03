# ─── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared/package.json ./shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN NODE_OPTIONS=--max-old-space-size=460 npm ci --maxsockets=1

COPY shared/ ./shared/
COPY server/ ./server/
COPY client/ ./client/
RUN npm run build

# ─── Stage 2: production image ────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Package manifests needed for workspace dep resolution
COPY package*.json ./
COPY shared/package.json ./shared/
COPY server/package*.json ./server/
COPY client/package.json ./client/

# Install server production deps only (express, socket.io, nanoid)
RUN NODE_OPTIONS=--max-old-space-size=460 npm ci --workspace=server --omit=dev --maxsockets=1

# Copy compiled server and built client from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001
CMD ["node", "server/dist/server/src/index.js"]
