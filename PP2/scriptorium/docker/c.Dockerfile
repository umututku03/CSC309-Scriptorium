FROM gcc:latest
WORKDIR /sandbox

# Add gcc to PATH and verify installation
ENV PATH="/usr/local/bin:/usr/bin:${PATH}"

RUN useradd -m -U runner
RUN mkdir -p /sandbox && \
    chown -R runner:runner /sandbox && \
    chmod 777 /sandbox

# Create the entrypoint script with command detection
RUN echo '#!/bin/bash\n\
\n\
# If the first argument is a special command\n\
if [ "$1" = "--version" ] || [ "$1" = "-v" ]; then\n\
    gcc --version\n\
    exit 0\n\
fi\n\
\n\
if [ "$1" = "--gcc-path" ]; then\n\
    which gcc\n\
    exit 0\n\
fi\n\
\n\
# Normal compilation path\n\
if [ ! -f "$1" ]; then\n\
    echo "Error: $1 not found."\n\
    exit 1\n\
fi\n\
\n\
gcc "$1" -o /sandbox/code.out 2>&1\n\
if [ $? -ne 0 ]; then\n\
    echo "Compilation failed"\n\
    exit 1\n\
fi\n\
\n\
/sandbox/code.out' > /usr/local/bin/run.sh

RUN chmod +x /usr/local/bin/run.sh
USER runner
ENTRYPOINT ["/usr/local/bin/run.sh"]