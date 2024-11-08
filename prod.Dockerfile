# Build Stage
FROM node:22.11.0-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci 

COPY . .

RUN npm run build

RUN npm prune --omit=dev


# Run Stage
FROM node:22.11.0-bookworm-slim AS run

RUN mkdir -p /home/node/app 

COPY --from=build --chown=node:node /app .

USER node

CMD ["node", "dist/index.js"]
