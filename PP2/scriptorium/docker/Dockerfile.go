FROM golang:1.18

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["go", "run"]