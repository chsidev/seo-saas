FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

RUN npm install

COPY . .

# RUN npm run build && npm run export
RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# RUN npm install -g serve

COPY --from=builder /app ./
# COPY --from=builder /app/out ./out
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/next.config.js ./next.config.js
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
# CMD ["serve", "-s", "out", "-l", "3000"]