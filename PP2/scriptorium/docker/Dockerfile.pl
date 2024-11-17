FROM perl:latest

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["perl"]