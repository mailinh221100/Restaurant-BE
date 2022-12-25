FROM node:16-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT [ "node", "index.js" ]