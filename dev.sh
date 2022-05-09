#!/bin/bash

cd backend && yarn
cd ../frontend && yarn
cd ..
docker-compose -f docker-compose.dev.yaml up --build
