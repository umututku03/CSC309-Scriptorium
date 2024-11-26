#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Starting setup for Scriptorium in $SCRIPT_DIR..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed."
  exit 1
fi
echo "✓ Docker is installed"

# Check Docker version
DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//;s/[^0-9.]//g')
REQUIRED_VERSION="20.10"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$DOCKER_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
  echo "Error: Docker 20.10+ is required. Found version: $DOCKER_VERSION"
  exit 1
fi
echo "✓ Docker version is sufficient ($DOCKER_VERSION)"

# Navigate to scriptorium directory
cd "$SCRIPT_DIR/scriptorium" || {
  echo "Error: Could not find scriptorium directory"
  exit 1
}

# Install npm dependencies
echo "Installing npm dependencies..."
if ! npm install; then
  echo "Error: npm install failed"
  exit 1
fi
echo "✓ npm dependencies installed"

# Run Prisma migrations
echo "Running Prisma migrations..."
if ! npx prisma migrate dev; then
  echo "Error: Prisma migrations failed"
  exit 1
fi
echo "✓ Prisma migrations completed"

# Check if Docker directory exists
if [ ! -d "docker" ]; then
  echo "Error: docker directory not found in scriptorium"
  exit 1
fi

# Build Docker images for supported languages
echo "Building Docker images for supported languages..."
LANGUAGES=(
  "python"
  "js"
  "c"
  "cpp"
  "java"
  "go"
  "rs"
  "rb"
  "php"
  "swift"
  "pl"
  "r"
)

# First verify all Dockerfiles exist
for lang in "${LANGUAGES[@]}"; do
  if [ ! -f "docker/${lang}.Dockerfile" ]; then
    echo "Error: Dockerfile not found for $lang (docker/${lang}.Dockerfile)"
    exit 1
  fi
done

# Build images
for lang in "${LANGUAGES[@]}"; do
  echo "Building Docker image for $lang..."
  if ! docker build -t "${lang}-executor" -f "docker/${lang}.Dockerfile" .; then
    echo "Error: Failed to build Docker image for $lang"
    exit 1
  fi
  echo "✓ Built ${lang}-executor"
done

echo "✓ All Docker images built successfully!"

# Verify all images were created
echo "Verifying Docker images..."
for lang in "${LANGUAGES[@]}"; do
  if ! docker image inspect "${lang}-executor" &> /dev/null; then
    echo "Error: Image ${lang}-executor was not created successfully"
    exit 1
  fi
done

echo "✓ All images verified"
echo "Setup complete! 🚀"