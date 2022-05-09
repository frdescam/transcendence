FROM	node:lts-alpine
WORKDIR /usr/src/app/

COPY    frontend/. frontend
COPY    backend/. .

# Build frontend
RUN     (cd frontend && yarn install && yarn build)

# Build backend
RUN     yarn install

ARG     NODE_ENV
ENV 	NODE_ENV=${NODE_ENV}
RUN     yarn build

CMD ["node", "dist/main"]
