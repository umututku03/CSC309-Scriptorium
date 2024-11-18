FROM r-base:latest

WORKDIR /sandbox
COPY . /sandbox

ENTRYPOINT ["Rscript"]