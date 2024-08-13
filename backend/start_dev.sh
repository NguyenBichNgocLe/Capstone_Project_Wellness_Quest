#!/bin/bash

function setEnv() {
    env_file="./server/.env"

    # Check if the .env file exists
    if [ ! -f "$env_file" ]; then
        echo "Error: The .env file does not exist in ./server/"
        exit 1
    fi

    # Read and echo the content of the .env file
    while IFS= read -r line; do
        export "$line"
    done < "$env_file"
}

function startContainers() {
    # Check for running Docker containers starting with "wq"
    if [ -z "$(docker ps --format '{{.Names}}' | grep '^wq')" ]; then
        setEnv
        docker-compose up -d
        sleep 4
    fi
}

startContainers

cd ./server
npm run dev