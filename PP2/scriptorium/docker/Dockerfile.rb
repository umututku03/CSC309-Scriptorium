FROM ruby:latest

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["ruby"]