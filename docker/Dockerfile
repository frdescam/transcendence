#FROM	node:lts-alpine
#WORKDIR /usr/src/app

#COPY    package*.json ./
#COPY    yarn*.lock ./

#RUN     npm install
#COPY    . .

#RUN		npm run build

#CMD		["node", "dist/main"]

# == FRONT == ##
FROM	node:lts-alpine
WORKDIR /usr/src/app/front

COPY    frontend/package*.json ./
COPY    frontend/yarn*.lock ./

RUN     yarn install
COPY    frontend/. .
RUN		yarn build

# == BACK == ##
FROM	node:lts-alpine
WORKDIR /usr/src/app/back

COPY    backend/package*.json ./
COPY    backend/yarn*.lock ./

RUN     yarn install
COPY    backend/. .
RUN		yarn build

CMD		["node", "dist/main"]
