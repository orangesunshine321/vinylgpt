# ===== Build Stage =====
FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install OpenSSL 1.1 for Prisma
RUN apt-get update \
 && apt-get install -y --no-install-recommends libssl1.1 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 1) Copy package.json and install all dependencies
COPY package.json ./
RUN npm install

# 2) Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# 3) Copy rest of the app & build
COPY . .
RUN npm run build

# ===== Production Stage =====
FROM node:18-bullseye-slim
WORKDIR /app

# Install OpenSSL so the Prisma engine can load
RUN apt-get update \
 && apt-get install -y --no-install-recommends libssl1.1 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy the built app from the builder stage
COPY --from=builder /app ./

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm","start"]
