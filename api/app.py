import codecs
import data_provider
import json
import flask
import logging
import sys

from datetime import datetime, timedelta

app = flask.Flask(__name__)

LOG_FORMAT = '%(asctime)s %(levelname)s\t%(message)s\t%(pathname)s:%(lineno)d %(funcName)s %(process)d %(threadName)s'

sys.stdout = codecs.getwriter('utf-8')(sys.stdout)
sys.stderr = codecs.getwriter('utf-8')(sys.stderr)

app_log = logging.getLogger('app')
access_log = logging.getLogger('werkzeug')

_log_handler = logging.StreamHandler(stream=sys.stderr)
_log_handler.setFormatter(logging.Formatter(LOG_FORMAT))

app_log.addHandler(_log_handler)
app_log.setLevel(logging.INFO)

app.logger.addHandler(_log_handler)
app.logger.setLevel(logging.WARN)

access_log.addHandler(_log_handler)
access_log.setLevel(logging.INFO)


@app.route('/')
def index():
    return create_json_response([{'welcome': 'Welcome to Scrapper 487 API'}])


@app.route('/robots.txt')
def robots_txt():
    return 'User-agent: *\nDisallow: /'


@app.route('/get-documents')
def get_documents():
    return get_data_provider_response(data_provider.get_documents)


@app.route('/get-document')
def get_document():
    return get_data_provider_response(data_provider.get_document)


@app.route('/get-documents-by-category')
def get_documents_by_category():
    return get_data_provider_response(data_provider.get_documents_by_category)


@app.route('/get-categories')
def get_categories():
    return get_data_provider_response(data_provider.get_category_names)


@app.route('/get-digest')
def get_digest():
    return get_data_provider_response(data_provider.get_digest)


@app.route('/get-stats')
def get_stats():
    return get_data_provider_response(data_provider.get_stats)


@app.errorhandler(404)
def error_404(*args):
    return create_json_response([{'error': 'Invalid API method'}], status=404)


def get_data_provider_response(getter):
    url_params = flask.request.args

    try:
        data = getter(**url_params)
    except data_provider.ParamsError as e:
        return create_json_response([{'error': e.message}], 400)

    fields = None
    if 'fields' in url_params and url_params['fields']:
        fields = url_params['fields'].split(',')

    if data_provider.is_custom_content_provider(getter):
        resp = create_custom_response(data, fields=fields)
    else:
        resp = create_json_response(data, fields=fields)

    cache_params = data_provider.get_cache_params(getter)

    api_headers = {
        'access-control-allow-origin': '*',
        'vary': 'accept-encoding',
    }

    if cache_params.get('no_cache'):
        api_headers.update({
            'cache-control': 'no-cache, no-store',
            'expires': create_header_date(days=-365),
        })
    elif cache_params.get('eternal') and not app.debug:
        api_headers.update({
            'cache-control': 'public, immutable, max-age=31536000',
            'expires': create_header_date(days=365),
        })

    for name, val in api_headers.iteritems():
        resp.headers[name] = val

    return resp


def create_json_response(data, status=200, fields=None):
    if fields:
        data = filter_fields(data, fields)

    resp = flask.make_response(json.dumps(data, ensure_ascii=False), status)
    resp.headers['content-type'] = 'application/json; charset=utf-8'

    return resp


def create_custom_response(data, status=200, fields=None):
    if data is None:
        return create_json_response([{'error': 'Document not found'}], 404)

    content_type = data['content_type']
    resp_content = data['content']

    if content_type.startswith('text/'):
        resp_content = flask.render_template('wrapper.html', **data)
        content_type = content_type.replace('text/plain', 'text/html')

    resp = flask.make_response(resp_content, status)
    resp.headers['content-type'] = content_type

    return resp


def filter_fields(data, fields):
    if not isinstance(data, list):
        return data

    new_data = []
    for doc in data:
        new_doc = {}
        for field in fields:
            print field, doc.keys()
            if field in doc:
                new_doc[field] = doc[field]
        new_data.append(new_doc)

    return new_data


def create_header_date(**kwargs):
    return (datetime.now() + timedelta(**kwargs)).strftime('%a, %d %b %Y %H:%M:%S GMT')
