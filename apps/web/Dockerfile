FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json turbo.json pnpm-workspace.yaml ./
COPY packages/ui-token/package.json ./packages/ui-token/
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/web/package.json ./apps/web/

RUN npm install

COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web
RUN npm run typecheck

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/src /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
