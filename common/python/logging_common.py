import codecs
import logging
import os
import sys
import time

LOG_FORMAT = '%(asctime)s %(levelname)s\t%(message)s\t%(pathname)s:%(lineno)d %(funcName)s %(process)d %(threadName)s'
LOG_LEVEL = os.environ.get('LOG_LEVEL', logging.INFO)

log_handler = logging.StreamHandler(stream=sys.stderr)
log_handler.setFormatter(logging.Formatter(LOG_FORMAT))

log = None


class NewsLogger(logging.Logger):
    def __init__(self, name, level=logging.NOTSET):
        super(NewsLogger, self).__init__(name, level)

        self._measure_registry = {}

    def measure_start(self, name):
        self._measure_registry[name] = time.time()

    def measure_end(self, name):
        if name not in self._measure_registry:
            return None

        duration = time.time() - self._measure_registry[name]
        self.info('Measure::duration::%s: %f', name, duration)

        del self._measure_registry[name]

        return duration


logging.setLoggerClass(NewsLogger)


def setup():
    global log

    sys.stdout = codecs.getwriter('utf-8')(sys.stdout)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr)

    log = logging.getLogger('app')
    flask_log = logging.getLogger('werkzeug')

    log.addHandler(log_handler)
    log.setLevel(logging.INFO)

    flask_log.addHandler(log_handler)
    flask_log.setLevel(logging.INFO)
