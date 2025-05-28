# ===== Build Stage =====
FROM node:18-bullseye-slim AS builder
WORKDIR /app

# 1. Install OpenSSL 1.1 (needed by Prisma)
RUN apt-get update \
 && apt-get install -y --no-install-recommends libssl1.1 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 2. Copy package manifests and install deps
COPY package.json ./
RUN npm install

# 3. Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# 4. Copy the rest and build Next.js
COPY . .
RUN npm run build

# ===== Production Stage =====
FROM node:18-bullseye-slim
WORKDIR /app

# Install OpenSSL for runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends libssl1.1 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy built app from builder
COPY --from=builder /app ./

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
