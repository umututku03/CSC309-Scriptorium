FROM php:latest

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["php"]