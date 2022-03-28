FROM	node:lts-alpine

WORKDIR	/usr/src/app

COPY	./app .

RUN		npm run build

CMD		["node", "dist/main"]
