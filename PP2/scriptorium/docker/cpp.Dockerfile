FROM gcc:latest

WORKDIR /sandbox
COPY docker/entrypoint.cpp.sh /sandbox/entrypoint.sh
RUN chmod +x /sandbox/entrypoint.sh

ENTRYPOINT ["/sandbox/entrypoint.sh"]