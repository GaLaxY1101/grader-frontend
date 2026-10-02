# Grader frontend (Next.js). Built and started by grader/compose.server.yaml.

FROM node:22-alpine AS base
RUN npm install -g pnpm@10.33.0
WORKDIR /app

# ── Dependencies ─────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# --ignore-scripts: skips the husky "prepare" hook (no .git in the image).
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Build ────────────────────────────────────────────────────
FROM base AS build
# Inlined into the browser bundle at build time, so it must be known here.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    SKIP_ENV_VALIDATION=1 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Lint runs in CI; a Windows checkout (CRLF) would fail Prettier here.
RUN mkdir -p public && pnpm build --no-lint

# ── Runtime ──────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
