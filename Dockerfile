# ─── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# .npmrc is copied from the build context so npm can reach the private registry.
# It stays ONLY in this builder stage — multi-stage builds discard it before
# the final image is assembled, so credentials never end up in the shipped layer.
COPY .npmrc /root/.npmrc

COPY package*.json ./
COPY shared/package.json ./shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci

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

# .npmrc again for the production install step (still builder-stage-equivalent here)
COPY .npmrc /root/.npmrc

# Install server production deps only (express, socket.io, nanoid)
RUN npm ci --workspace=server --omit=dev && rm /root/.npmrc

# Copy compiled server and built client from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001
CMD ["node", "server/dist/server/src/index.js"]
