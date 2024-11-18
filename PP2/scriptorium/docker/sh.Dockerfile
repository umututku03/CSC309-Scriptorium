FROM bash:latest

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["bash"]