# ===== Build Stage =====
FROM node:18-alpine AS builder
WORKDIR /app

# Copy only package.json (no lock file) and install deps
COPY package.json ./
RUN npm install

# Copy all source & build
COPY . .
RUN npm run build

# ===== Production Stage =====
FROM node:18-alpine
WORKDIR /app

# Copy built app and node_modules from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm","start"]
