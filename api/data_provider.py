import dateutil.parser
import logging
import pymongo
import os
import re
import text_utils

from bson import objectid

CATEGORIES = {
    'buzzinga': {
        'tags': 'buzzinga',
        'no-tags': '',
        'digest': False,
    },
    'fin': {
        'tags': 'finances,no_tech',
        'no-tags': 'tech,twitter',
    },
    'js': {
        'tags': 'tech,js',
        'no-tags': 'no_tech,twitter',
    },
    'node': {
        'tags': 'tech,node',
        'no-tags': 'no_tech,twitter',
    },
    'perf': {
        'tags': 'tech,perf',
        'no-tags': 'no_tech,twitter',
    },
    'services': {
        'tags': 'tech,services',
        'no-tags': 'no_tech,twitter',
    },
    'tech': {
        'tags': 'tech',
        'no-tags': 'no_tech,search,twitter',
    },
    'tw': {
        'tags': 'twitter',
        'no-tags': 'buzzinga',
        'digest': False,
    },
    'web': {
        'tags': 'tech,web',
        'no-tags': 'no_tech,services,twitter',
    },
    'news': {
        'tags': 'no_tech,world',
        'no-tags': 'tech,twitter',
        'digest': False,
    },
}

CATEGORY_NAMES = CATEGORIES.keys()

log = logging.getLogger('app')

_mongo_db = None
_tags_validator = re.compile('^[\w\s,]+$', re.UNICODE)


class ParamsError(Exception):
    pass


def custom_content_provider(func):
    func.custom_content_provider = True
    return func


def is_custom_content_provider(func):
    return getattr(func, 'custom_content_provider', False)


def cache_params(**kwargs):
    def wrapper(func):
        func.cached_params = kwargs
        return func
    return wrapper


def get_cache_params(func):
    return getattr(func, 'cached_params', {})


@cache_params(no_cache=True)
def get_documents(**kwargs):
    log.info('Start search documents. Params: %s', kwargs.keys())

    db = _get_mongo_db()

    query, order, limit = create_query(**kwargs)
    res = make_query(db, query, order, limit)

    log.info('End search documents')
    return res


@custom_content_provider
@cache_params(eternal=True)
def get_document(**kwargs):
    log.info('Start search document. Params: %s', kwargs.keys())

    if 'id' not in kwargs or not kwargs['id']:
        raise ParamsError('ID is required')

    try:
        doc_id = objectid.ObjectId(kwargs['id'][-1])
    except objectid.InvalidId:
        return None

    db = _get_mongo_db()
    doc = db.items.find_one({'_id': doc_id})

    if not doc:
        return None

    doc = dress_item(doc)

    content_type = doc.get('text_content_type', 'text/html; charset=utf-8')
    content = doc.get('text', doc.get('description', ''))

    is_text = content_type.startswith('text/plain')
    if is_text:
        content = text_utils.highlight_urls(content)

    doc_data = {
        'title': doc['title'],
        'content_type': content_type,
        'is_text': is_text,
        'content': content,
    }

    doc_data.update(text_utils.get_metadata(doc, content))

    log.info('End search document')

    return doc_data


@cache_params(no_cache=True)
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

    tags = cat_data.get('tags')
    no_tags = cat_data.get('no-tags')

    if tags:
        args['tags'] = [tags]

    if no_tags:
        args['no-tags'] = [no_tags]

    args['op'] = ['and']
    del args['name']

    query, order, limit = create_query(**args)

    res = make_query(db, query, order, limit)

    log.info('End search documents by category')
    return res


@cache_params(no_cache=True)
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

        tags = cat_data.get('tags')
        no_tags = cat_data.get('no-tags')

        if tags:
            args['tags'] = [tags]

        if no_tags:
            args['no-tags'] = [no_tags]

        args['op'] = ['and']

        query, order, limit = create_query(**args)
        or_part.append(query)

    data = make_query(db, big_query, order, limit)

    log.info('End creating digest')
    return data


@cache_params(no_cache=True)
def get_category_names(*args, **kwargs):
    return [{'name': name} for name in CATEGORY_NAMES]


@cache_params(no_cache=True)
def get_stats(**kwargs):
    db = _get_mongo_db()

    cursor = db.items.aggregate([
        {'$group': {'_id': '$source_name', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
    ])

    data = []
    for item in cursor:
        data.append({'source_name': item['_id'], 'docs': item['count']})

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

    return [dress_item(doc) for doc in cursor]


def dress_item(item):
    if '_id' in item:
        item['id'] = str(item['_id'])
        del item['_id']

    if 'link' in item and item['link']:
        item['link'] = text_utils.get_document_link(item)

    if 'published' in item and item['published']:
        item['published'] = item['published'].strftime('%Y-%m-%dT%H:%M:%S')

    for name in ('title', 'description', 'text'):
        if name in item:
            if item[name]:
                item[name] = text_utils.replace_email_settings_links(item[name])

    return item
