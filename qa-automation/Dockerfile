FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx playwright install chromium

CMD ["npx", "playwright", "test"]
