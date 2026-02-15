# Use Node 22 Alpine for the smallest footprint
FROM node:22-alpine AS base

# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack to use pnpm natively
RUN corepack enable && corepack prepare pnpm@latest --activate

# Your preferred working directory
WORKDIR /app

# ENV PATH /app/node_modules/.bin:$PATH

# Copy package files first
COPY package.json pnpm-lock.yaml* ./

EXPOSE 4000

# --- Development Stage ---
FROM base AS development
# Uses BuildKit cache to speed up pnpm installs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
COPY . .
# Node 22 native watch mode
CMD ["pnpm", "run", "dev"]

# --- Production Stage ---
FROM base AS production
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
COPY . .
CMD ["pnpm", "run", "start"]
