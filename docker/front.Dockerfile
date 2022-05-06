FROM	node:lts-alpine
WORKDIR /usr/src/app/

COPY    frontend/. .

RUN     yarn install
RUN     yarn build