#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# cd to the next.js project directory
cd scriptorium

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev


# Check required compilers and interpreters
echo "Checking required compilers and interpreters..."

# Node.js 20+ check
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_VERSION" -ge 20 ]]; then
  echo "Node.js version is sufficient."
else
  echo "Error: Node.js 20+ is required."
  exit 1
fi

# Python 3.10+ check
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2 | tr -d '\n')
if (( $(echo "$PYTHON_VERSION >= 3.10" | bc -l) )); then
  echo "Python version is sufficient."
else
  echo "Error: Python 3.10+ is required."
  exit 1
fi

# gcc and g++
if ! command -v gcc &> /dev/null; then
  echo "Error: gcc is not installed."
  exit 1
fi
if ! command -v g++ &> /dev/null; then
  echo "Error: g++ is not installed."
  exit 1
fi
echo "gcc and g++ are available."

# Java 20+ check
JAVA_VERSION=$(java -version 2>&1 | awk -F[\".] '{print $2}' | tr -d '\n')
if [[ "$JAVA_VERSION" -ge 20 ]]; then
  echo "Java version is sufficient"
else
  echo "Error: Java 20+ is required."
  exit 1
fi

# Create an admin user in the database
echo "Creating admin user..."
npx prisma db seed