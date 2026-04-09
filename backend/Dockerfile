# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    apk add --no-cache --virtual .native-deps python3 make g++ \
    && npm ci \
    && apk del .native-deps

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache wget

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    apk add --no-cache --virtual .native-deps python3 make g++ \
    && npm ci --omit=dev \
    && apk del .native-deps

COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/main.js"]
