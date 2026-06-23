FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json ./
RUN pnpm install

# Copy source and build
COPY tsconfig.json .
COPY src ./src
RUN pnpm exec tsc

FROM node:20-alpine AS runner

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
# Install only production dependencies
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

# Port for the Fastify server
EXPOSE 3001

CMD ["node", "dist/index.js"]
