FROM	node:16-alpine
WORKDIR /usr/src/app/

# Config env
ARG     VITE_API_HOST
ENV     VITE_API_HOST=${VITE_API_HOST}
ARG     FRONTEND_HOST
ENV     FRONTEND_HOST=${FRONTEND_HOST}
ARG     API_HOST
ENV     API_HOST=${API_HOST}

# Build backend
COPY    backend/. .
COPY    .env .
COPY    common/. ./src/common

RUN     yarn install
RUN     yarn build

# Build frontend
COPY    frontend/. frontend
COPY    common/. frontend/src/common
RUN     yarn --cwd frontend install
RUN     yarn --cwd frontend build

# Running env
ARG     NODE_ENV
ENV     NODE_ENV=${NODE_ENV}

CMD ["node", "dist/main"]
