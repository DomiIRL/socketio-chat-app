# STAGE 1
FROM node:18-alpine as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install -g npm@9.3.1
RUN npm install -g typescript
RUN npm install -g ts-node
USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build

# STAGE 2
FROM nginx
RUN mkdir -p /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
COPY --from=builder /home/node/app/dist /usr/share/nginx/html