FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY tsconfig.json .
COPY src ./src
RUN pnpm exec tsc

FROM node:20-alpine AS runner

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# Port for the Fastify server
EXPOSE 3001

CMD ["node", "dist/index.js"]
