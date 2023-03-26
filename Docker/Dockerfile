FROM node:19-alpine3.16

WORKDIR /lcov-compare

COPY package*.json ./
RUN npm install

COPY main.js ./

COPY Docker/docker-entrypoint.sh /usr/local/bin
ENTRYPOINT ["docker-entrypoint.sh"]
