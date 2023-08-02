FROM node:20.2.0-alpine3.18

RUN npm i -g pnpm

COPY ./package.json package.json
COPY ./pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install -P

COPY . .

RUN pnpm build

EXPOSE 9272

CMD [ "pnpm", "start" ]
