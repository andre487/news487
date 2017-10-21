import dateutil.parser
import logging
import MySQLdb
import pymongo
import os
import re
import sys
import text_utils

from bson import objectid

CATEGORIES = {
    'buzzinga': {
        'tags': 'buzzinga',
        'no-tags': '',
        'digest': False,
    },
    'browsers': {
        'tags': 'tech,browsers',
        'no-tags': 'no_tech,twitter',
    },
    'css': {
        'tags': 'tech,css',
        'no-tags': 'no_tech,twitter',
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
        'disabled': True,
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
        'disabled': True,
    },
    'web': {
        'tags': 'tech,web',
        'no-tags': 'no_tech,services,twitter',
        'disabled': True,
    },
    'news': {
        'tags': 'no_tech,world',
        'no-tags': 'tech,twitter',
        'digest': False,
    },
}

log = logging.getLogger('app')

_mongo_db = None
_sphinx_connection = None
_sphinx_index = None

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

    if 'text' in kwargs:
        query, limit, doc_ids = create_query_text_search(**kwargs)
        if query is None:
            return []
        docs = make_query(db, query, None, limit)
        res = reorder_docs_by_ids(docs, doc_ids)
    else:
        query, order, limit = create_query_general(**kwargs)
        if query is None:
            return []
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

    doc_data = {
        'title': doc['title'],
        'content_type': content_type,
        'is_text': is_text,
        'content': content,
    }

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
        raise ParamsError('Category is invalid. Need one of %s' % CATEGORIES.keys())

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

    query, order, limit = create_query_general(**args)

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

        query, order, limit = create_query_general(**args)
        or_part.append(query)

    data = make_query(db, big_query, order, limit)

    log.info('End creating digest')
    return data


@cache_params(no_cache=True)
def get_category_names(*args, **kwargs):
    return [{'name': name} for name, params in CATEGORIES.iteritems() if not params.get('disabled')]


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


def create_query_general(**kwargs):
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

    if 'doc-ids' in kwargs:
        add_find_by_doc_ids(query, kwargs['doc-ids'][-1])

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


def add_find_by_doc_ids(query, doc_ids_str):
    doc_ids = doc_ids_str.split(',')
    mongo_ids = [objectid.ObjectId(doc_id) for doc_id in doc_ids]
    query.append({'_id': {'$in': mongo_ids}})


def create_query_text_search(**kwargs):
    text = kwargs['text'] and kwargs['text'][-1].strip()
    if not text:
        raise ParamsError('Text should not be empty')

    sphinx, index_name = _get_sphinx_connection()
    cursor = sphinx.cursor()

    query = 'SELECT doc_id FROM {index} WHERE MATCH(%s)'.format(index=index_name)
    cursor.execute(query, [text])

    doc_ids = [item[0] for item in cursor]
    cursor.close()

    _close_sphinx_connection()

    if not doc_ids:
        return None, None, None

    args = kwargs.copy()
    del args['text']
    args['doc-ids'] = [','.join(doc_ids)]

    query, _, limit = create_query_general(**args)

    return query, limit, doc_ids


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


def _get_sphinx_connection():
    global _sphinx_connection, _sphinx_index

    if _sphinx_connection and _sphinx_index:
        return _sphinx_connection, _sphinx_index

    host = os.environ.get('SPHINX_HOST', '127.0.0.1')
    port = int(os.environ.get('SPHINX_PORT', 9306))
    index_name = os.environ.get('SPHINX_INDEX', 'news_documents')

    log.info('Create new SphinxQL client. Host %s, port %s', host, port)

    _sphinx_connection = MySQLdb.connect(host=host, port=port)
    _sphinx_index = index_name

    return _sphinx_connection, _sphinx_index


def _close_sphinx_connection():
    global _sphinx_connection, _sphinx_index

    if _sphinx_connection:
        _sphinx_connection.close()

        _sphinx_connection = None
        _sphinx_index = None


def make_query(db, query, order, limit):
    cursor = db.items.find(query)
    if order is not None:
        cursor = cursor.sort([('published', order)])

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

    return item


def reorder_docs_by_ids(docs, doc_ids):
    if docs is None or doc_ids is None:
        return None

    doc_order = {}
    for i in range(0, len(doc_ids)):
        doc_order[doc_ids[i]] = i

    def compare(a, b):
        a_pos = doc_order.get(a['id'], sys.maxint)
        b_pos = doc_order.get(b['id'], sys.maxint)

        return a_pos - b_pos

    docs.sort(compare)

    return docs
