FROM node:20.18.0-alpine 

RUN mkdir /app

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]



