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
    'buzzinga': {
        'tags': 'buzzinga',
        'no-tags': '',
        'digest': False,
    },
    'cs': {
        'tags': 'computer science',
        'no-tags': '',
    },
    'finances': {
        'tags': 'finances,no_tech',
        'no-tags': 'tech',
    },
    'js': {
        'tags': 'tech,js',
        'no-tags': 'no_tech',
    },
    'perf': {
        'tags': 'tech,perf',
        'no-tags': 'no_tech',
    },
    'search': {
        'tags': 'tech,search',
        'no-tags': 'no_tech',
        'digest': False,
    },
    'services': {
        'tags': 'tech,services',
        'no-tags': 'no_tech,search',
    },
    'tech': {
        'tags': 'tech',
        'no-tags': 'no_tech,search',
    },
    'twits': {
        'tags': 'twitter',
        'no-tags': 'buzzinga',
        'digest': False,
    },
    'web': {
        'tags': 'tech,web',
        'no-tags': 'no_tech,services',
    },
    'world-news': {
        'tags': 'no_tech,world',
        'no-tags': 'tech',
        'digest': False,
    },
}

CATEGORY_NAMES = CATEGORIES.keys()

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
        raise ParamsError('Category is invalid. Need one of %s' % CATEGORY_NAMES)

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

    if 'tags' in kwargs:
        raise ParamsError('Tags query is not supported with digest')

    if 'no-tags' in kwargs:
        raise ParamsError('No tags query is not supported with digest')

    if 'op' in kwargs:
        raise ParamsError('Operator is not supported with digest')

    db = _get_mongo_db()

    order = -1
    limit = 10

    big_query = {'$or': []}
    or_part = big_query['$or']

    for cat_name, cat_data in CATEGORIES.iteritems():
        if not cat_data.get('digest', True):
            continue

        args = kwargs.copy()

        args['tags'] = [cat_data['tags']]
        args['no-tags'] = [cat_data['no-tags']]
        args['op'] = ['and']

        query, order, limit = create_query(**args)
        or_part.append(query)

    data = make_query(db, big_query, order, limit)

    log.info('End creating digest')
    return data


def get_category_names(*args, **kwargs):
    return [{'name': name} for name in CATEGORY_NAMES]


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
