FROM node:20.2.0

RUN npm i -g pnpm

COPY ./package.json package.json
COPY ./pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install

COPY . .

RUN pnpm build

CMD [ "pnpm", "start" ]
