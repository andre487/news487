import logging
import pymongo
import os
import re

log = logging.getLogger('app')
_mongo_client = None

_tags_validator = re.compile('^[\w,]+$', re.UNICODE)


class ParamsError(Exception):
    pass


def get_documents(**kwargs):
    log.info('Start search. Params: %s', kwargs.keys())

    client = _get_mongo_client()
    db_name = os.environ.get('MONGO_DB', 'news_documents')
    db = client[db_name]

    order = -1
    limit = 0
    op = 'and'

    if 'order' in kwargs:
        order = int(kwargs['order'][-1])
    if 'limit' in kwargs:
        limit = int(kwargs['limit'][-1])
    if 'op' in kwargs and kwargs['op'] and kwargs['op'][0] == 'or':
        op = 'or'

    query = {}

    if 'tags' in kwargs:
        add_find_by_tags(query, ','.join(kwargs['tags']), op)

    if 'source_name' in kwargs:
        add_find_by_source(query, kwargs['source_name'][-1])

    if 'author_name' in kwargs:
        add_find_by_author(query, kwargs['author_name'][-1])

    if 'text' in kwargs:
        add_find_by_text(query, ' '.join(kwargs['text']))

    res = make_query(db, query, order, limit)

    log.info('End search')
    return res


def add_find_by_tags(query, tags, op):
    if not _tags_validator.match(tags):
        raise ParamsError('Invalid tags format. Need tag1,tag2,tag3')

    tags_list = sorted(tags.split(','))
    joiner = '' if op == 'and' else '|'
    pattern = joiner.join('(?:.*(?:^|,|)' + tag + '(?:,|$).*)' for tag in tags_list)

    query.update({'tags': {'$regex': pattern}})


def add_find_by_source(query, source):
    query.update({'source_name': source})


def add_find_by_author(query, source):
    query.update({'author_name': source})


def add_find_by_text(query, text):
    query.update({'$text': {'$search': text}})


def _get_mongo_client():
    global _mongo_client

    if _mongo_client:
        return _mongo_client

    host = os.environ.get('MONGO_HOST', 'localhost')
    port = int(os.environ.get('MONGO_PORT', 27017))

    log.info('Create new MongoDB client. Host %s, port %s', host, port)

    _mongo_client = pymongo.MongoClient(host, port)

    return _mongo_client


def make_query(db, query, order, limit):
    cursor = db.items.find(query).sort([('published', order)])
    if limit:
        cursor = cursor.limit(limit)

    data = []
    for doc in cursor:
        del doc['_id']
        data.append(doc)

    return data
