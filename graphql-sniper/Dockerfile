# ---------------------
# 1️⃣ Base
# ---------------------
FROM node:22-alpine AS base

WORKDIR /app
RUN corepack enable

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy app package.json (important for caching)
COPY apps/api/package.json apps/api/package.json

# Install all workspace deps
RUN CI=true pnpm install --frozen-lockfile

# ---------------------
# 2️⃣ Development
# ---------------------
FROM base AS development

COPY . .

EXPOSE 3000

CMD ["pnpm", "--filter", "@sniper/api", "start:dev"]

# ---------------------
# 3️⃣ Build
# ---------------------
FROM base AS build

COPY . .

RUN pnpm --filter @sniper/api build

# ---------------------
# 4️⃣ Production
# ---------------------
FROM node:22-alpine AS production

WORKDIR /app
RUN corepack enable

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

RUN CI=true pnpm install --prod --frozen-lockfile

# Copy built app
COPY --from=build /app/apps/api/dist ./apps/api/dist

EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]
