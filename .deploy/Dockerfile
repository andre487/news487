FROM debian:9.1

RUN mkdir -p /usr/local/bin/app
WORKDIR /usr/local/bin/app

COPY . /usr/local/bin/app

RUN apt-get update && \
    apt-get install -y python-pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get purge -y python-pip && \
    apt-get clean
