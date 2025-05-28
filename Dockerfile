# ===== Build Stage =====
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Install OpenSSL (required for Prisma on Alpine)
RUN apk add --no-cache openssl

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source & build
COPY . .
RUN npm run build

# ===== Production Stage =====
FROM node:18-alpine
WORKDIR /app

# Copy built app, node_modules, and runtime files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm","start"]
