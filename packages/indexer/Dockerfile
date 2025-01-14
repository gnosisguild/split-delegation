# syntax = docker/dockerfile:1

FROM node:21-slim

LABEL fly_launch_runtime="Node.js"

# Install pnpm
RUN npm install -g pnpm

# Install necessary packages for Prisma
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3 openssl

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src

# Install dependencies
RUN pnpm install

# Build the application
ENV NODE_ENV="production"
RUN npm run build

# Expose the Prometheus metrics ports
# (PROMETHEUS_PORT env var is read by @subsquid/util-internal-prometheus-server)
# ENV PROMETHEUS_PORT=3000  
EXPOSE 3000-3099

CMD ["pnpm", "run", "start"]

