#!/bin/bash

# Default command
DEFAULT_CMD="docker compose up --attach backend"

# Function to show usage
usage() {
  echo
  echo "Usage: $0 [backend|all|build|seed|drop|close|background|help]"
  echo "Options:"
  echo "  backend       Run 'docker compose up --attach backend' (start only the backend service)"
  echo "  all           Run 'docker compose up' (start all services)"
  echo "  build         Run 'docker compose up --build' (build images before starting)"
  echo "  seed          Run 'docker compose up -d' and seed the database"
  echo "  drop          Run 'docker compose up -d' and drop the database"
  echo "  close         Run 'docker compose down' (stop all services)"
  echo "  background    Run 'docker compose up -d' (start all services in background)"
  echo "  help          Show this help message"
  echo "By default, the script runs the command: docker compose up --attach backend"   
  echo  
  exit 1
}

# Parse the first argument
case "$1" in
    backend)
        echo "Running: docker compose up --attach backend"
        docker compose up --attach backend
        ;;
    all)
        echo "Running: docker compose up"
        docker compose up
        ;;
    build)
        echo "Running: docker compose up --build"
        docker compose up --build
        ;;
    seed)
        echo "Running: docker compose up -d && npm run seed"
        docker compose up -d
        docker exec -it telware-backend-backend-1 npm run seed
        ;;
    drop)
        echo "Running: docker compose up -d && npm run drop"
        docker compose up -d
        docker exec -it telware-backend-backend-1 npm run drop
        ;;
    close)
        echo "Running: docker compose down"
        docker compose down
        ;;
    background)
        echo "Running: docker compose up -d"
        docker compose up -d
        ;;
    help)
        usage
        ;;
    "" )
        echo "Running default: $DEFAULT_CMD"
        $DEFAULT_CMD
        ;;
    *)
        echo "Invalid option: $1"
        usage
        ;;
esac
