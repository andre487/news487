FROM node:8.4

RUN mkdir -p /usr/local/bin/app
WORKDIR /usr/local/bin/app

COPY . /usr/local/bin/app

RUN set -x && \
    npm install --production && \
    npm cache clean -f && \
    find /tmp -type f -exec rm {} \; && \
    find /var/tmp -type f -exec rm {} \;

CMD ./cli/run.js
