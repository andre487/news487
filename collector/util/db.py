import logging
import pymongo
import os

log = logging.getLogger('app')

host = os.environ.get('MONGO_HOST')
port = int(os.environ.get('MONGO_PORT', 27017))
mongo_db = os.environ.get('MONGO_DB', 'news_documents')

_collection = None


def get_collection():
    global _collection

    if not host:
        return

    if _collection:
        return _collection

    log.info('Connecting to MongoDB: %s:%s', host, port)

    db = pymongo.MongoClient(host, port)[mongo_db]
    _collection = db['items']

    return _collection


def close():
    if host:
        log.info('Closing connection to MongoDB: %s:%s', host, port)
        pymongo.MongoClient(host, port).close()
