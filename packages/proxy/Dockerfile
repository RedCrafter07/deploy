FROM node:20.2.0-alpine3.18

# install pnpm
RUN npm i -g pnpm

# copy package files
COPY ./package.json package.json
COPY ./pnpm-lock.yaml pnpm-lock.yaml

# install dependencies
RUN pnpm install

# copy source files
# -> this is done after installing dependencies to prevent re-installing dependencies on every change
COPY . .

# build
RUN pnpm build

CMD [ "pnpm", "start" ]
