FROM	node:lts-alpine
WORKDIR /usr/src/app/

# Backend
COPY    backend/. .
COPY	.env .

RUN     yarn
RUN		yarn build

# Frontend
COPY    frontend/. frontend

RUN		yarn --cwd frontend
RUN		yarn --cwd frontend build

ARG     NODE_ENV
ENV 	NODE_ENV=${NODE_ENV}

CMD		["node", "dist/main"]