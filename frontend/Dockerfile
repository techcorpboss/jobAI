FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3009
EXPOSE 3009

CMD ["node", "server.js"]
