#!/bin/bash
# Entrypoint script for Java
javac TempJavaClass.java
if [ $? -ne 0 ]; then
    echo "Compilation failed"
    exit 1
fi
if [ -f input.txt ]; then
    java TempJavaClass < input.txt
else
    java TempJavaClass
fi