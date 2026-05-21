# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo root files needed by npm workspaces
COPY package.json package-lock.json tsconfig.base.json ./

# Copy all workspace package manifests (npm needs them to set up symlinks)
COPY packages/types/package.json       ./packages/types/package.json
COPY packages/config/package.json      ./packages/config/package.json
COPY packages/ui/package.json          ./packages/ui/package.json
COPY apps/cms/package.json             ./apps/cms/package.json
COPY apps/web/package.json             ./apps/web/package.json
COPY apps/mt5-service/package.json     ./apps/mt5-service/package.json

# Install all deps (dev included — needed for tsc, ts-node, payload CLI)
RUN npm ci

# Copy full source for packages and cms only
COPY packages/ ./packages/
COPY apps/cms/ ./apps/cms/

# 1. Build @newera365/types → JS (the CMS compiled output depends on it at runtime)
WORKDIR /app/packages/types
RUN npm run build

# 2. Build Payload admin UI (webpack) + server TypeScript
WORKDIR /app/apps/cms
ENV PAYLOAD_CONFIG_PATH=src/payload.config.ts
RUN npm run build

# Prune dev deps from the full node_modules tree
WORKDIR /app
RUN npm prune --omit=dev

# ── Production runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=dist/payload.config.js

# Root package.json (needed so Node workspace symlinks resolve correctly)
COPY --from=builder /app/package.json ./

# Pruned production node_modules (contains symlinks to workspace packages)
COPY --from=builder /app/node_modules/ ./node_modules/

# @newera365/types compiled JS (workspace symlink in node_modules points here)
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --from=builder /app/packages/types/dist/        ./packages/types/dist/

# CMS compiled output
COPY --from=builder /app/apps/cms/package.json ./apps/cms/package.json
COPY --from=builder /app/apps/cms/dist/        ./apps/cms/dist/
COPY --from=builder /app/apps/cms/build/       ./apps/cms/build/

WORKDIR /app/apps/cms

EXPOSE 3001
CMD ["node", "dist/server.js"]
