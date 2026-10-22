FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY package.json turbo.json pnpm-workspace.yaml ./
COPY packages/ui-token/package.json ./packages/ui-token/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN npm install

# Copy source codes
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Generate database client & build server
WORKDIR /app/packages/database
RUN npx prisma generate

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
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/

EXPOSE 4000

CMD ["node", "apps/server/dist/main.js"]
