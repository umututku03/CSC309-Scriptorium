#!/bin/bash
# Entrypoint script for C++

# Check if the source code exists
if [ ! -f /sandbox/code.cpp ]; then
    echo "Error: /sandbox/code.cpp not found."
    exit 1
fi

# Compile the code
g++ /sandbox/code.cpp -o /sandbox/code.out
if [ $? -ne 0 ]; then
    echo "Compilation failed"
    exit 1
fi

# Check if input.txt exists
if [ -f /sandbox/input.txt ]; then
    /sandbox/code.out < /sandbox/input.txt
else
    /sandbox/code.out
fi