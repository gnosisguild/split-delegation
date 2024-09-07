FROM node:20.16-alpine3.19

# Set up work directory
WORKDIR /app

ADD . .
RUN cd packages/api && yarn install

CMD ["npm", "run", "sync"]
