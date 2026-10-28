FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY package.json package-lock.json turbo.json ./
COPY packages/ui-tokens/package.json ./packages/ui-tokens/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN npm ci

# Copy source codes
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Generate database client & build server
WORKDIR /app
RUN npm run db:generate --prefix packages/database

WORKDIR /app/apps/server
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/contracts ./packages/contracts
COPY --from=builder /app/packages/ui-tokens ./packages/ui-tokens
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/

EXPOSE 4000

CMD ["node", "apps/server/dist/main.js"]
