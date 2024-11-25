FROM openjdk:11-jdk-slim
WORKDIR /sandbox

RUN useradd -m -U runner
RUN mkdir -p /sandbox && \
    chown -R runner:runner /sandbox && \
    chmod 777 /sandbox

# Create the entrypoint script
RUN echo '#!/bin/bash\n\
if [ ! -f "$1" ]; then\n\
    echo "Error: $1 not found."\n\
    exit 1\n\
fi\n\
\n\
# Get the class name from the file name\n\
className=$(basename "$1" .java)\n\
\n\
# Compile Java file\n\
javac "$1" 2>&1\n\
if [ $? -ne 0 ]; then\n\
    echo "Compilation failed"\n\
    exit 1\n\
fi\n\
\n\
# Run the compiled class\n\
cd /sandbox && java "$className"' > /usr/local/bin/run.sh

RUN chmod +x /usr/local/bin/run.sh
USER runner
ENTRYPOINT ["/usr/local/bin/run.sh"]