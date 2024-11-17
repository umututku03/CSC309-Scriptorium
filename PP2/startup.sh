#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting setup for Scriptorium..."

# Navigate to the Next.js project directory
cd scriptorium

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed."
  exit 1
fi
echo "Docker is installed."

# Check Docker version
DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//;s/[^0-9.]//g')
REQUIRED_VERSION="20.10"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$DOCKER_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
  echo "Error: Docker 20.10+ is required."
  exit 1
fi
echo "Docker version is sufficient."

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "Error: Docker Compose is not installed."
  exit 1
fi
echo "Docker Compose is installed."

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Run Prisma migrations
echo "Running Prisma migrations..."
if ! npx prisma migrate dev; then
  echo "Error: Prisma migrations failed."
  exit 1
fi

# Build Docker images for supported languages
echo "Building Docker images for supported languages..."
LANGUAGES=("python" "js" "c" "cpp" "java" "go" "rs" "rb" "php" "swift" "pl" "sh" "ts" "r")
for lang in "${LANGUAGES[@]}"; do
  echo "Building Docker image for $lang..."
  if ! docker build -t sandbox_$lang -f docker/Dockerfile.$lang .; then
    echo "Error: Failed to build Docker image for $lang."
    exit 1
  fi
done
echo "All Docker images built successfully!"

# Create an admin user in the database
echo "Creating admin user..."
if ! npx prisma db seed; then
  echo "Error: Failed to seed database."
  exit 1
fi

echo "Setup complete!"