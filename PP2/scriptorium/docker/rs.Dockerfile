FROM rust:latest
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
rustc "$1" -o /sandbox/code.out 2>&1\n\
if [ $? -ne 0 ]; then\n\
    echo "Compilation failed"\n\
    exit 1\n\
fi\n\
/sandbox/code.out' > /usr/local/bin/run.sh

RUN chmod +x /usr/local/bin/run.sh
USER runner
ENTRYPOINT ["/usr/local/bin/run.sh"]