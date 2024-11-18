FROM python:3.10-slim

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["python3"]