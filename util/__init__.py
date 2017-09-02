import argparse
import logging
import os
import re
import sys

from multiprocessing.pool import ThreadPool
from os import path
from rss import parse_feed_by_name
from spiders import run_spider_by_name
from util.write import write_data

file_name_getter = re.compile(r'(.+?)\.py')

log = logging.getLogger('app')
_log_handler = logging.StreamHandler(stream=sys.stderr)
_log_handler.setFormatter(
    logging.Formatter(
        '%(asctime)s %(levelname)s\t%(message)s\t%(pathname)s:%(lineno)d %(funcName)s %(process)d %(threadName)s'
    )
)
log.addHandler(_log_handler)


def get_cli_args(scrappers=None):
    if scrappers is None:
        scrappers = get_scrappers()

    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('--log-level', default=logging.INFO)

    arg_parser.add_argument('--mongo', type=parse_host_arg, help='Write to MongoDB, param format: host(:port)?')
    arg_parser.add_argument('--mongo-db', default='news_documents', help='Database name')
    arg_parser.add_argument('--mongo-user')
    arg_parser.add_argument('--mongo-password')

    action_parsers = arg_parser.add_subparsers(dest='action', help='Actions')

    run_parser = action_parsers.add_parser('run', help='Run scrappers')
    run_parser.add_argument('names', nargs='+', choices=scrappers['all'])

    action_parsers.add_parser('list', help='List scrappers')

    args = arg_parser.parse_args()
    return args


def parse_host_arg(value):
    matches = re.match(r'^(\w+)(?::(\d+))?$', value)
    if not matches:
        raise argparse.ArgumentTypeError('Wrong host value: %s' % value)

    return {
        'host': matches.group(1),
        'port': int(matches.group(2) or 0),
    }


def setup(args):
    log.setLevel(args.log_level)


def get_scrappers():
    scrappers = {
        'rss': [],
        'spiders': [],
    }
    base_dir = path.join(path.dirname(__file__), '..')

    for root, dirs, files in os.walk(path.join(base_dir, 'rss')):
        scrappers['rss'] = get_scrapper_files(files)

    for root, dirs, files in os.walk(path.join(base_dir, 'spiders')):
        scrappers['spiders'] = get_scrapper_files(files)

    scrappers['all'] = ['all'] + scrappers['rss'] + scrappers['spiders']
    return scrappers


def get_scrapper_files(files):
    return [get_file_name(name) for name in files if not name.startswith('_') and name.endswith('.py')]


def get_file_name(name):
    matches = file_name_getter.match(name)
    if not matches:
        raise ValueError('Wrong scrapper file name: %s' % name)
    return matches.group(1)


def run_scrappers(args, scrappers):
    log.info('Start scrappers run')

    data = []
    names_set = set(args.names)

    if 'all' in names_set:
        rss_handlers = scrappers['rss']
        spider_handlers = scrappers['spiders']
    else:
        rss_handlers = set(scrappers['rss']).intersection(names_set)
        spider_handlers = set(scrappers['spiders']).intersection(names_set)

    def callback(res):
        flat_res = []
        for item in res:
            flat_res += item

        for item in flat_res:
            data.append(item)

    pool = ThreadPool()

    pool.map_async(
        _run_rss_handler,
        rss_handlers,
        callback=callback,
    )

    pool.close()
    pool.join()

    for spider in spider_handlers:
        log.info('Start spider handling: %s', spider)
        data += run_spider_by_name(spider)
        log.info('End spider handling: %s', spider)

    log.info('End scrappers run')

    log.info('Start sorting data')
    data.sort(key=lambda item: item['published'], reverse=True)
    log.info('End sorting data')

    log.info('Start write data')
    write_data(args, data)
    log.info('End write data')


def _run_rss_handler(feed):
    try:
        log.info('Start feed handling: %s', feed)
        res = parse_feed_by_name(feed)
        log.info('End feed handling: %s', feed)
        return res
    except Exception as e:
        log.error('Error in %s: %s', feed, e)
        return []
