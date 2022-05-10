FROM	node:lts-alpine
WORKDIR /usr/src/app/

COPY    backend/. .
RUN     yarn install

ARG     NODE_ENV
ENV 	NODE_ENV=${NODE_ENV}
