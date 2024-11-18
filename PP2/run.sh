#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting the Scriptorium development environment..."

# Navigate to the project directory
cd scriptorium

# Start the Next.js development server
echo "Starting the Next.js development server..."
npm run dev &

# Capture the PID of the Next.js server process
NEXT_JS_PID=$!

# Wait for the server to start and display its status
echo "Waiting for the Next.js server to start..."
sleep 5

if ps -p $NEXT_JS_PID > /dev/null; then
  echo "Next.js development server is running!"
else
  echo "Failed to start the Next.js development server."
  exit 1
fi

# Monitor the server
echo "To stop the development server, use Ctrl+C or kill the process ID: $NEXT_JS_PID"

# Keep the script running so the server stays up
wait $NEXT_JS_PID