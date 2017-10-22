FROM node:8.4

RUN mkdir -p /usr/local/bin/app
WORKDIR /usr/local/bin/app

ADD package.json /usr/local/bin/app/package.json

RUN set -x && \
    npm install --production && \
    npm cache clean -f && \
    find /tmp -type f -exec rm {} \; && \
    find /var/tmp -type f -exec rm {} \;

ADD . /usr/local/bin/app

CMD ./cli/run.js
