import logging
import pymongo
import os

CONNECT_TIMEOUT = 2000

log = logging.getLogger('app')
env = os.environ

host = env.get('MONGO_HOST')
port = int(env.get('MONGO_PORT', 27017))

login = env.get('MONGO_LOGIN')
password = env.get('MONGO_PASSWORD')

_client = None


def get_client():
    global _client

    if not host:
        return

    if _client:
        return _client

    log.info('Connecting to MongoDB: %s:%s', host, port)

    _client = pymongo.MongoClient(
        host, port,
        connect=True,
        connectTimeoutMS=CONNECT_TIMEOUT,
        username=login,
        password=password,
    )
    return _client


def close():
    global _client

    if _client:
        log.info('Closing connection to MongoDB: %s:%s', host, port)

        _client.close()
        _client = None
