import codecs
import data_provider
import json
import flask
import logging
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


@app.route('/')
def index():
    return create_api_response([{'welcome': 'Welcome to Scrapper 487 API'}])


@app.route('/get-documents')
def get_documents():
    try:
        data = data_provider.get_documents(**flask.request.args)
        return create_api_response(data)
    except data_provider.ParamsError as e:
        return create_api_response([{'error': e.message}], 400)


@app.route('/get-digest')
def get_digest():
    try:
        data = data_provider.get_digest(**flask.request.args)
        return create_api_response(data)
    except data_provider.ParamsError as e:
        return create_api_response([{'error': e.message}], 400)


@app.errorhandler(404)
def error_404(*args):
    return create_api_response([{'error': 'Invalid API method'}], status=404)


def create_api_response(data, status=200):
    resp = flask.make_response(json.dumps(data, ensure_ascii=False), status)
    resp.headers['Content-Type'] = 'application/json; charset=utf-8'
    return resp
