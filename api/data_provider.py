import logging
import pymongo
import os
import re

log = logging.getLogger('app')
_mongo_db = None

_tags_validator = re.compile('^[\w,]+$', re.UNICODE)


class ParamsError(Exception):
    pass


def get_documents(**kwargs):
    log.info('Start search documents. Params: %s', kwargs.keys())

    db = _get_mongo_db()

    query, order, limit = create_query(**kwargs)
    res = make_query(db, query, order, limit)

    log.info('End search documents')
    return res


def create_query(**kwargs):
    order = -1
    limit = 0
    op = 'and'

    if 'order' in kwargs:
        try:
            order = int(kwargs['order'][-1])
        except ValueError:
            raise ParamsError('Invalid order value')

    if 'limit' in kwargs:
        try:
            limit = int(kwargs['limit'][-1])
        except ValueError:
            raise ParamsError('Invalid limit value')

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

    return query, order, limit


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


def _get_mongo_db():
    global _mongo_db

    if _mongo_db:
        return _mongo_db

    host = os.environ.get('MONGO_HOST', 'localhost')
    port = int(os.environ.get('MONGO_PORT', 27017))

    log.info('Create new MongoDB client. Host %s, port %s', host, port)

    mongo_client = pymongo.MongoClient(host, port)

    db_name = os.environ.get('MONGO_DB', 'news_documents')
    _mongo_db = mongo_client[db_name]

    return _mongo_db


def make_query(db, query, order, limit):
    cursor = db.items.find(query).sort([('published', order)])
    if limit:
        cursor = cursor.limit(limit)

    data = []
    for doc in cursor:
        del doc['_id']
        data.append(doc)

    return data


def get_digest(**kwargs):
    log.info('Start creating digest. Params: %s', kwargs.keys())

    db = _get_mongo_db()

    query, order, limit = create_query(**kwargs)

    source_names = db.items.distinct('source_name', query)

    data = []
    for source_name in source_names:
        source_query = query.copy()
        source_query['source_name'] = source_name
        data += make_query(db, source_query, order, limit)

    data.sort(key=lambda x: x.get('published'), reverse=True)

    log.info('End creating digest')
    return data
