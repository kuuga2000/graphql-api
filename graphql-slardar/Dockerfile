# Use Node 22 Alpine for the smallest footprint
FROM node:22-alpine

# Enable corepack to use pnpm natively
RUN corepack enable && corepack prepare pnpm@latest --activate

# Your preferred working directory
WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of the project
COPY . .

EXPOSE 4000

CMD ["pnpm", "start"]
