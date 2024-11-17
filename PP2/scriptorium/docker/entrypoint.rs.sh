#!/bin/bash
# Entrypoint script for Rust
rustc code.rs -o code.out
if [ $? -ne 0 ]; then
    echo "Compilation failed"
    exit 1
fi
if [ -f input.txt ]; then
    ./code.out < input.txt
else
    ./code.out
fi