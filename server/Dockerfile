# STAGE 1
FROM node:18-alpine as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm config set unsafe-perm true
RUN npm install -g npm@9.3.1
RUN npm install -g typescript
RUN npm install -g ts-node
USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build

# STAGE 2
FROM node:18-alpine
RUN mkdir -p /home/node/app/node_modules
RUN mkdir -p /home/node/app/data && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install --production
COPY --from=builder /home/node/app/dist ./dist

#COPY --chown=node:node .env .
#COPY --chown=node:node  /config ./config
#COPY --chown=node:node  /public ./public

EXPOSE 3030
CMD [ "node", "dist/src/server.js" ]