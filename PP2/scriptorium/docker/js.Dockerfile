FROM node:16-slim
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
node "$1"' > /usr/local/bin/run.sh

RUN chmod +x /usr/local/bin/run.sh
USER runner
ENTRYPOINT ["/usr/local/bin/run.sh"]