FROM	node:lts-alpine
WORKDIR /usr/src/app/

COPY    backend/. .
RUN     yarn

ARG     NODE_ENV
ENV 	NODE_ENV=${NODE_ENV}
