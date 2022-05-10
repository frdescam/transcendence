#!/bin/bash

npm i -g yarn
(cd backend && yarn) & (cd frontend && yarn)
wait

docker-compose -f docker-compose.dev.yaml up --build
