FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo files & package manifests for all workspaces
COPY package.json package-lock.json turbo.json ./
COPY packages/ui-tokens/package.json ./packages/ui-tokens/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/

# Install dependencies (ignoring postinstall until schema is copied)
RUN npm ci --ignore-scripts

# Copy source codes
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/

EXPOSE 3000

CMD ["npm", "start", "--prefix", "apps/web"]
