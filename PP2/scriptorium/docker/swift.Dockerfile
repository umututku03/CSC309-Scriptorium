FROM swift:latest
WORKDIR /sandbox
RUN useradd -m -U runner
RUN mkdir -p /sandbox && \
    chown -R runner:runner /sandbox && \
    chmod 777 /sandbox

RUN echo '#!/bin/bash\n\
if [ ! -f "$1" ]; then\n\
    echo "Error: $1 not found."\n\
    exit 1\n\
fi\n\
# Compile and run Swift code\n\
swiftc "$1" -o /sandbox/program 2>&1\n\
if [ $? -ne 0 ]; then\n\
    echo "Compilation failed"\n\
    exit 1\n\
fi\n\
/sandbox/program' > /usr/local/bin/run.sh

RUN chmod +x /usr/local/bin/run.sh
USER runner
ENTRYPOINT ["/usr/local/bin/run.sh"]