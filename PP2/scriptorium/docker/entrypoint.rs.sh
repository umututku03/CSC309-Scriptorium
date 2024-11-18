#!/bin/bash
# Entrypoint script for Rust

# Ensure the source file exists
if [ ! -f /sandbox/code.rs ]; then
    echo "Error: /sandbox/code.rs not found."
    exit 1
fi

# Compile the Rust code
rustc /sandbox/code.rs -o /sandbox/code.out
if [ $? -ne 0 ]; then
    echo "Compilation failed"
    exit 1
fi

# Execute the compiled binary
if [ -f /sandbox/input.txt ]; then
    /sandbox/code.out < /sandbox/input.txt
else
    /sandbox/code.out
fi