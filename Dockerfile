FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/auctions >/dev/null || exit 1

# Creates/updates the SQLite schema, seeds demo data on first boot, serves.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && npx next start -p ${PORT:-3000}"]
