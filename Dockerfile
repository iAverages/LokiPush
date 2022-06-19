FROM node:16.15.1

RUN mkdir /app
WORKDIR /app

COPY . .
COPY package.json .

RUN ["yarn","install"]

ENTRYPOINT ["yarn", "run", "test"]
