FROM openjdk:17-slim

WORKDIR /sandbox
COPY docker/entrypoint.java.sh /sandbox/entrypoint.sh
RUN chmod +x /sandbox/entrypoint.sh

ENTRYPOINT ["/sandbox/entrypoint.sh"]