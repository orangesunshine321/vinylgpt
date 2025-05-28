# ===== Build Stage =====
FROM node:18-alpine AS builder
WORKDIR /app

# 1. Copy only package.json & install deps
COPY package.json ./
RUN npm install

# 2. Copy the rest, generate Prisma client, then build
COPY prisma ./prisma
RUN npx prisma generate

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
