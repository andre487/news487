import codecs
import data_provider
import json
import flask
import logging
import os
import sys

sys.stdout = codecs.getwriter('utf-8')(sys.stdout)
sys.stderr = codecs.getwriter('utf-8')(sys.stderr)

log = logging.getLogger('app')
_log_handler = logging.StreamHandler(stream=sys.stderr)
_log_handler.setFormatter(
    logging.Formatter(
        '%(asctime)s %(levelname)s\t%(message)s\t%(pathname)s:%(lineno)d %(funcName)s %(process)d %(threadName)s'
    )
)
log.addHandler(_log_handler)
log.setLevel(logging.INFO)

app = flask.Flask(__name__)

scrapper_api_host = os.environ.get('SCRAPPER_API_HOST', 'http://localhost:5000')


@app.route('/')
def index():
    return create_api_response([{'welcome': 'Welcome to Scrapper 487 API'}])


@app.route('/get-documents')
def get_documents():
    return get_documents_general(data_provider.get_documents)


@app.route('/get-document')
def get_document():
    return get_documents_general(data_provider.get_document)


@app.route('/get-documents-by-category')
def get_documents_by_category():
    return get_documents_general(data_provider.get_documents_by_category)


@app.route('/get-categories')
def get_categories():
    return get_documents_general(data_provider.get_category_names)


@app.route('/get-digest')
def get_digest():
    return get_documents_general(data_provider.get_digest)


@app.route('/get-stats')
def get_stats():
    return get_documents_general(data_provider.get_stats)


@app.errorhandler(404)
def error_404(*args):
    return create_api_response([{'error': 'Invalid API method'}], status=404)


def get_documents_general(getter):
    try:
        data = getter(**flask.request.args)
        if data_provider.is_custom_content_provider(getter):
            return create_custom_response(data)
        else:
            return create_api_response(data)
    except data_provider.ParamsError as e:
        return create_api_response([{'error': e.message}], 400)


def create_api_response(data, status=200):
    data = map(serialize_items, data)

    resp = flask.make_response(json.dumps(data, ensure_ascii=False), status)
    resp.headers['Content-Type'] = 'application/json; charset=utf-8'

    return resp


def create_custom_response(data, status=200):
    if data is None:
        resp = flask.make_response('Document not found', 404)
        resp.headers['Content-Type'] = 'text/plain; charset=utf-8'
        return resp

    content_type, content = data

    resp = flask.make_response(content, status)
    resp.headers['Content-Type'] = content_type

    return resp


def serialize_items(item):
    if '_id' in item:
        item['id'] = str(item['_id'])
        del item['_id']

    if 'link' in item and item['link'].startswith('EmailID('):
        link_path = flask.url_for('get_document', id=item['id'])
        item['link'] = scrapper_api_host + link_path

    if 'published' in item:
        item['published'] = item['published'].strftime('%Y-%m-%dT%H:%M:%S')

    return item
