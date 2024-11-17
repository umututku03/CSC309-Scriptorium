FROM node:16

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["node"]