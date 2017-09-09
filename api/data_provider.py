import dateutil.parser
import logging
import pymongo
import os
import re

CATEGORIES = {
    'browsers': {
        'tags': 'browsers,tech,web',
        'no-tags': 'no_tech,services',
    },
    'finances': {
        'tags': 'finances,no_tech',
        'no-tags': 'tech',
    },
    'services': {
        'tags': 'tech,services',
        'no-tags': 'no_tech',
    },
    'tech': {
        'tags': 'tech',
        'no-tags': 'no_tech',
    },
    'web': {
        'tags': 'tech,web',
        'no-tags': 'no_tech,services',
    },
    'world-news': {
        'tags': 'no_tech,world',
        'no-tags': 'tech',
    },
}

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


def get_documents_by_category(**kwargs):
    log.info('Start search documents by category. Params: %s', kwargs.keys())

    if 'name' not in kwargs or not kwargs['name']:
        raise ParamsError('Name is required')

    if 'tags' in kwargs:
        raise ParamsError('Tags query is not supported with category')

    if 'no-tags' in kwargs:
        raise ParamsError('No tags query is not supported with category')

    if 'op' in kwargs:
        raise ParamsError('Operator is not supported with category')

    cat_data = CATEGORIES.get(kwargs['name'][-1])
    if not cat_data:
        raise ParamsError('Category is invalid. Need one of %s' % CATEGORIES.keys())

    db = _get_mongo_db()
    args = kwargs.copy()

    args['tags'] = [cat_data.get('tags')]
    args['no-tags'] = [cat_data.get('no-tags')]
    args['op'] = ['and']
    del args['name']

    query, order, limit = create_query(**args)

    res = make_query(db, query, order, limit)

    log.info('End search documents by category')
    return res


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


def create_query(**kwargs):
    order = -1
    limit = 0
    op = 'and'
    from_date = None

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

    if 'op' in kwargs and kwargs['op'][-1] == 'or':
        op = 'or'

    if 'from-date' in kwargs:
        from_date = dateutil.parser.parse(kwargs['from-date'][-1])

    full_query = {'$and': []}
    query = full_query['$and']

    if from_date:
        query.append({'published': {'$gt': from_date}})

    if 'tags' in kwargs:
        add_find_by_tags(query, ','.join(kwargs['tags']), op)

    if 'no-tags' in kwargs:
        add_exclude_by_tags(query, ','.join(kwargs['no-tags']))

    if 'source-name' in kwargs:
        add_find_by_source(query, kwargs['source-name'][-1])

    if 'author-name' in kwargs:
        add_find_by_author(query, kwargs['author-name'][-1])

    if 'text' in kwargs:
        add_find_by_text(query, ' '.join(kwargs['text']))

    if not full_query['$and']:
        full_query = {}

    return full_query, order, limit


def add_find_by_tags(query, tags, op):
    if not tags:
        return

    if not _tags_validator.match(tags):
        raise ParamsError('Invalid tags format. Need tag1,tag2,tag3')

    pattern = create_tags_pattern(tags, op)

    query.append({'tags': pattern})


def add_exclude_by_tags(query, tags):
    if not tags:
        return

    pattern = create_tags_pattern(tags, 'or')

    query.append({'tags': {'$not': pattern}})


def create_tags_pattern(tags, op):
    tags_list = sorted(tags.split(','))

    joiner = '(?:,|$).*' if op == 'and' else '(?:,|$)|'
    pattern = '(?:^|.+,)' + joiner.join(tags_list)

    return re.compile(pattern)


def add_find_by_source(query, source):
    query.append({'source_name': source})


def add_find_by_author(query, source):
    query.append({'author_name': source})


def add_find_by_text(query, text):
    query.append({'$text': {'$search': text}})


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
