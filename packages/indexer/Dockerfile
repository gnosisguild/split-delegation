# syntax = docker/dockerfile:1

ARG NODE_VERSION=21
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

COPY ./package.json /app/package.json
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS prod-deps
ENV NODE_ENV="production"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
COPY --link . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/lib /app/lib
COPY --link ./schema.cypherl /app/schema.cypherl

# Expose the Prometheus metrics ports
# (PROMETHEUS_PORT env var is read by @subsquid/util-internal-prometheus-server)
# ENV PROMETHEUS_PORT=3000  
EXPOSE 3000-3099

# Start the processor
CMD [ "pnpm", "run", "start" ]
