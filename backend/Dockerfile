FROM --platform=linux/amd64 node:20.2

WORKDIR /server

ADD ./server /server/

RUN npm install

EXPOSE 4848

CMD ["npm", "start"]