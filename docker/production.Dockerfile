FROM	node:lts-alpine
WORKDIR /usr/src/app/

# Build backend
COPY    backend/. .
RUN     yarn install
RUN     yarn build

# Build frontend
COPY    frontend/. frontend
RUN     (cd frontend && yarn install && yarn build)

CMD ["node", "dist/main"]
