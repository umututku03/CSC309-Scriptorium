FROM node:16

WORKDIR /sandbox
RUN npm install -g typescript ts-node
COPY . /sandbox

ENTRYPOINT ["ts-node"]