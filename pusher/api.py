import json
import data_provider
import flask

app = flask.Flask(__name__)


@app.route('/add-token', methods=['POST'])
def add_token():
    token = flask.request.data
    return handle_request(data_provider.add_token, token)


def handle_request(handler, *args, **kwargs):
    try:
        return create_response({
            'result': handler(*args, **kwargs),
            'success': True,
        })
    except data_provider.ParamsError as e:
        return create_response({
            'success': False,
            'error_type': 'InvalidArgument',
            'result': e.message,
        }, code=400)
    except Exception as e:
        return create_response({
            'success': False,
            'error_type': 'GeneralError',
            'result': e.message,
        }, code=500)


def create_response(data, code=200):
    resp = flask.make_response(json.dumps(data), code)

    resp.headers['content-type'] = 'application/json; charset=utf-8'
    resp.headers['access-control-allow-origin'] = '*'

    return resp
