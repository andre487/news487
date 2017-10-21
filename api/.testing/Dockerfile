FROM debian:9.1

EXPOSE 5000

RUN mkdir -p /var/requirements
WORKDIR /var/requirements

RUN set -x && \
    apt-get update && \
    apt-get dist-upgrade -y && \
    apt-get install -y python-pip libcurl4-openssl-dev libssl-dev default-libmysqlclient-dev && \
    apt-get clean -y && \
    apt-get autoclean -y && \
    rm -f /var/cache/apt/*.bin && \
    find /tmp -type f -exec rm {} \; && \
    find /var/tmp -type f -exec rm {} \;

ADD requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /usr/local/bin/app
WORKDIR /usr/local/bin/app
