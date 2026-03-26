FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY koropay-frontend/package*.json ./
RUN npm ci

COPY koropay-frontend ./
RUN VITE_API_URL=/api npm run build

# ─── Backend builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY koropay-backend/package*.json ./
RUN npm ci

COPY koropay-backend/prisma ./prisma
RUN npx prisma generate

COPY koropay-backend/tsconfig.json ./
COPY koropay-backend/src ./src
COPY koropay-backend/prisma/seed.ts ./src/seed.ts

RUN npm run build

# ─── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

COPY koropay-backend/package*.json ./
RUN npm ci --omit=dev

COPY koropay-backend/prisma ./prisma
RUN npx prisma generate

COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /frontend/dist ./koropay-frontend/dist

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/seed.js && node dist/app.js"]
