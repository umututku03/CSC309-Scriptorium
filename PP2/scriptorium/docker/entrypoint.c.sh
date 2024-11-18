#!/bin/bash
# Entrypoint script for C

# Check if the source code exists
if [ ! -f /sandbox/code.c ]; then
    echo "Error: /sandbox/code.c not found."
    exit 1
fi

# Compile the code
gcc /sandbox/code.c -o /sandbox/code.out
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