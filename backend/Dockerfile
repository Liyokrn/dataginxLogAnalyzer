FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
COPY packages/agent-config/package.json ./packages/agent-config/package.json

RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages/agent-config/node_modules ./packages/agent-config/node_modules
COPY . .

RUN pnpm --filter backend exec tsc

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy production files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
COPY packages/agent-config/package.json ./packages/agent-config/package.json

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/backend/dist ./backend/dist

# Port for the Fastify server
EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
