FROM node:24-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace manifest files first for layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json tsconfig.json ./

# Copy all packages
COPY lib ./lib
COPY artifacts ./artifacts
COPY scripts ./scripts

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared libraries
RUN pnpm run typecheck:libs

# Build frontend (dummy PORT for build)
ENV BASE_PATH=/ PORT=3000
RUN pnpm --filter @workspace/khutbah run build

# Copy built frontend into API server
RUN mkdir -p artifacts/api-server/dist/public && \
    cp -r artifacts/khutbah/dist/public/* artifacts/api-server/dist/public/

# Build API server
RUN pnpm --filter @workspace/api-server run build

# Copy built frontend into API dist
RUN cp -r artifacts/khutbah/dist/public/* artifacts/api-server/dist/public/

# DB migrations (will run at startup with real DATABASE_URL)
# We'll run migrations in the start command

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "pnpm --filter @workspace/db run push && node --enable-source-maps artifacts/api-server/dist/index.mjs"]
