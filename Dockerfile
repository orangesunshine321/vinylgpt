# ===== Build Stage =====
FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install OpenSSL 1.1 for Prisma generation (optional, but safe)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libssl1.1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 1. Copy only package.json & install deps
COPY package.json package-lock.json* ./
RUN npm install

# 2. Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# 3. Copy everything else & build
COPY . .
RUN npm run build

# ===== Production Stage =====
FROM node:18-bullseye-slim
WORKDIR /app

# Install OpenSSL 1.1 so the Prisma query engine can load
RUN apt-get update && \
    apt-get install -y --no-install-recommends libssl1.1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy built app and node_modules over
COPY --from=builder /app ./

# Expose the port and run
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm","start"]
