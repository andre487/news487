FROM debian:9.1

ENV MONGO_HOST=common-mongo \
    SPHINX_INDEX_DIR=/var/lib/sphinx/idx \
    SPHINX_RUN_DIR=/var/run/sphinx

RUN mkdir -p "${SPHINX_INDEX_DIR}" && \
    mkdir -p "${SPHINX_RUN_DIR}" \
    mkdir -p /etc/get-documents

EXPOSE 9306
VOLUME ["${SPHINX_INDEX_DIR}"]

ADD requirements.txt /etc/get-documents/requirements.txt

RUN set -x && \
    apt-get update && \
    apt-get dist-upgrade -y && \
    apt-get install -y sphinxsearch python-pip supervisor && \
    pip install --no-cache-dir -r /etc/get-documents/requirements.txt && \
    apt-get purge -y \
        python-pip binutils build-essential cpp cpp-6 dpkg-dev \
        g++ g++-6 gcc gcc-6 libalgorithm-diff-perl \
        libalgorithm-diff-xs-perl libalgorithm-merge-perl \
        libc-dev-bin libc6-dev  libdpkg-perl libfakeroot \
        libfile-fcntllock-perl libgcc-6-dev  \
        liblocale-gettext-perl libperl5.24 libpython-all-dev libpython-dev \
        libpython2.7-dev libstdc++-6-dev linux-libc-dev make \
        manpages-dev patch perl perl-modules-5.24 \
        python-all-dev python-dev python-gi \
        python-pip-whl \
        python-setuptools python-wheel \
        python2.7-dev && \
    apt-get clean -y && \
    apt-get autoclean -y && \
    rm -f /var/cache/apt/*.bin && \
    find /tmp -type f -exec rm {} \; && \
    find /var/tmp -type f -exec rm {} \;

ADD .devtools/sphinx.conf /etc/sphinxsearch/sphinx.conf
ADD .devtools/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ADD get-documents /usr/local/bin/get-documents
ADD .devtools/start-search.sh /usr/local/bin/start-search.sh
ADD .devtools/start-indexing.sh /usr/local/bin/start-indexing.sh

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
