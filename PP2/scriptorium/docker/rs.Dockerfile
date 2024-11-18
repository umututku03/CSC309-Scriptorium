FROM rust:latest

WORKDIR /sandbox
COPY docker/entrypoint.rs.sh /sandbox/entrypoint.sh
RUN chmod +x /sandbox/entrypoint.sh

ENTRYPOINT ["/sandbox/entrypoint.sh"]