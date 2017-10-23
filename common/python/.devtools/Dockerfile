FROM debian:9

RUN mkdir -p /usr/local/bin/app
RUN mkdir -p /usr/local/bin/py_common

WORKDIR /usr/local/bin/app

RUN apt-get update && \
    apt-get dist-upgrade -y && \
    apt-get install -y python-pip && \
    apt-get clean -y && \
    apt-get autoclean -y && \
    rm -f /var/cache/apt/*.bin && \
    find /tmp -type f -exec rm {} \; && \
    find /var/tmp -type f -exec rm {} \;

ADD . /usr/local/bin/py_common

ENV PYTHONPATH="/usr/local/bin/py_common:${PYTHONPATH}"
