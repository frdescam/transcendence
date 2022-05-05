#FROM	node:lts-alpine
#WORKDIR /usr/src/app

#COPY    package*.json ./
#COPY    yarn*.lock ./

#RUN     npm install
#COPY    . .

#RUN		npm run build

#CMD		["node", "dist/main"]

# == BACK == ##
FROM	node:lts-alpine
WORKDIR /usr/src/app/backend

COPY    backend/package*.json ./
COPY    backend/yarn*.lock ./

RUN     yarn install
COPY    backend/. .
RUN		yarn build

# == FRONT == ##
FROM	node:lts-alpine
WORKDIR /usr/src/app/frontend

COPY    frontend/package*.json ./
COPY    frontend/yarn*.lock ./

RUN     yarn install
COPY    frontend/. .
RUN		yarn build

# == START == ##
CMD		["node", "dist/main"]
