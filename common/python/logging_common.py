import codecs
import logging
import os
import sys

LOG_FORMAT = '%(asctime)s %(levelname)s\t%(message)s\t%(pathname)s:%(lineno)d %(funcName)s %(process)d %(threadName)s'
LOG_LEVEL = os.environ.get('LOG_LEVEL', logging.INFO)

log_handler = logging.StreamHandler(stream=sys.stderr)
log_handler.setFormatter(logging.Formatter(LOG_FORMAT))

log = logging.getLogger('app')


def setup():
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr)

    _app_log = logging.getLogger('app')
    _flask_log = logging.getLogger('werkzeug')

    _app_log.addHandler(log_handler)
    _app_log.setLevel(logging.INFO)

    _flask_log.addHandler(log_handler)
    _flask_log.setLevel(logging.INFO)
