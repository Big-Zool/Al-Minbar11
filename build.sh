#!/usr/bin/env bash
set -e

echo "==> Installing dependencies"
npm install -g pnpm
pnpm install --frozen-lockfile

echo "==> Building shared libs"
pnpm run typecheck:libs

echo "==> Building React frontend"
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/khutbah run build

echo "==> Copying frontend into API server"
mkdir -p artifacts/api-server/dist/public
cp -r artifacts/khutbah/dist/public/* artifacts/api-server/dist/public/

echo "==> Building API server"
pnpm --filter @workspace/api-server run build

echo "==> Copying frontend into built API dist"
cp -r artifacts/khutbah/dist/public/* artifacts/api-server/dist/public/

echo "Build complete!"
