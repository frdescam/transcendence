FROM	node:lts-alpine
WORKDIR /usr/src/app/

COPY    backend/. .

RUN     yarn install
RUN     yarn build