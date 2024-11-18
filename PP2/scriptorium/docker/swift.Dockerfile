FROM swift:latest

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["swift"]