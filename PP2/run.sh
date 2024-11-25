#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Starting the Scriptorium development environment..."

# Check if the scriptorium directory exists
if [ ! -d "$SCRIPT_DIR/scriptorium" ]; then
    echo "Error: scriptorium directory not found"
    exit 1
fi

# Navigate to the project directory
cd "$SCRIPT_DIR/scriptorium" || {
    echo "Error: Could not navigate to scriptorium directory"
    exit 1
}

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Have you run startup.sh first?"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Error: node_modules not found. Running npm install..."
    npm install || {
        echo "Error: npm install failed"
        exit 1
    }
fi

# Function to check if port 3000 is available
check_port() {
    if lsof -i :3000 >/dev/null 2>&1; then
        echo "Error: Port 3000 is already in use"
        return 1
    fi
    return 0
}

# Check if port is available
check_port || exit 1

# Start the Next.js development server
echo "Starting the Next.js development server..."
npm run dev &
NEXT_JS_PID=$!

# Function to check if server is running
check_server() {
    local max_attempts=30
    local attempt=1
    
    echo "Waiting for the Next.js server to start..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo "✓ Next.js development server is running!"
            return 0
        fi
        
        if ! ps -p $NEXT_JS_PID >/dev/null 2>&1; then
            echo "Error: Next.js server process died"
            return 1
        fi
        
        echo "Attempt $attempt/$max_attempts: Server not ready yet..."
        sleep 1
        ((attempt++))
    done
    
    echo "Error: Server failed to start within expected time"
    return 1
}

# Check if server starts successfully
if ! check_server; then
    kill $NEXT_JS_PID 2>/dev/null || true
    exit 1
fi

# Print useful information
echo ""
echo "Development server information:"
echo "- Process ID: $NEXT_JS_PID"
echo "- URL: http://localhost:3000"
echo "- To stop: press Ctrl+C"
echo ""
echo "Monitoring server logs:"
echo "----------------------------------------"

# Trap Ctrl+C and cleanup
cleanup() {
    echo ""
    echo "Shutting down Next.js server..."
    kill $NEXT_JS_PID 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

# Keep the script running and monitor the server
while true; do
    if ! ps -p $NEXT_JS_PID >/dev/null 2>&1; then
        echo "Error: Next.js server process died unexpectedly"
        exit 1
    fi
    sleep 1
done