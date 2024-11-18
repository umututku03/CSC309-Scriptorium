#!/bin/bash
# Entrypoint script for Java

# Ensure the source file exists
if [ ! -f /sandbox/TempJavaClass.java ]; then
    echo "Error: /sandbox/TempJavaClass.java not found."
    exit 1
fi

# Compile the Java code
javac /sandbox/TempJavaClass.java
if [ $? -ne 0 ]; then
    echo "Compilation failed"
    exit 1
fi

# Execute the compiled class
if [ -f /sandbox/input.txt ]; then
    java -cp /sandbox TempJavaClass < /sandbox/input.txt
else
    java -cp /sandbox TempJavaClass
fi