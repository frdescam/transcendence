FROM	node:lts-alpine
WORKDIR /usr/src/app/

# Build backend
COPY    backend/. .
COPY    common/. ./src/common
RUN     yarn install
RUN     yarn build

# Build frontend
COPY    frontend/. frontend
COPY    common/. frontend/src/common
RUN     (cd frontend && yarn install && yarn build)

ARG     NODE_ENV
ENV     NODE_ENV=${NODE_ENV}

CMD ["node", "dist/main"]
