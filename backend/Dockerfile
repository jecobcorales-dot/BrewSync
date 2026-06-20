FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma/
RUN npx prisma generate
COPY src ./src/
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
