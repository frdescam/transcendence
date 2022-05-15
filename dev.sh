#!/bin/bash
# frontend:	http://localhost:3000
# backend:	http://localhost:8080
# pgadmin:	http://localhost:5000 admin@admin.com:root
# db:		http://localhost:5432 user:password

npm i -g yarn
(cd backend && yarn) & (cd frontend && yarn)
wait

docker-compose -f docker-compose.dev.yaml up --build
