# ===== Build Stage =====
FROM node:18-alpine AS builder
WORKDIR /app

# 1. Copy only package.json & install deps
COPY package.json ./
RUN npm install

# 2. Install OpenSSL (needed for Prisma generation and libssl1.1 compat)
RUN apk add --no-cache openssl openssl1.1

# 3. Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# 4. Copy source & build
COPY . .
RUN npm run build

# ===== Production Stage =====
FROM node:18-alpine
WORKDIR /app

# 1. Install OpenSSL 1.1 compat so Prisma engine can load at runtime
RUN apk add --no-cache openssl1.1

# 2. Copy built app & deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm","start"]
