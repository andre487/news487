FROM debian:9.1

RUN mkdir -p /usr/local/bin/app
WORKDIR /usr/local/bin/app

COPY . /usr/local/bin/app

RUN set -x && \
    apt-get update && \
    apt-get install -y python-pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get purge -y python-pip && \
    apt-get autoremove -y && \
    apt-get install -y python python-six python-enum34 && \
    apt-get clean
