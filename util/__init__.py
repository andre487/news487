import argparse
import json
import logging
import os
import re
import sys

from os import path
from rss import parse_feed_by_name
from spiders import run_spider_by_name

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

    action_parsers = arg_parser.add_subparsers(dest='action', help='Actions')

    run_parser = action_parsers.add_parser('run', help='Run scrappers')
    run_parser.add_argument('names', nargs='+', choices=scrappers['all'])

    action_parsers.add_parser('list', help='List scrappers')

    args = arg_parser.parse_args()
    return args


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


def write_data(args, data):
    print json.dumps(data, indent=2)


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

    for feed in rss_handlers:
        log.info('Start feed handling: %s', feed)
        data += parse_feed_by_name(feed)
        log.info('End feed handling: %s', feed)

    for spider in spider_handlers:
        log.info('Start spider handling: %s', spider)
        data += run_spider_by_name(spider)
        log.info('End spider handling: %s', spider)

    log.info('End scrappers run')

    log.info('Start sorting data')
    data.sort(key=lambda item: item['published'], reverse=True)
    log.info('End sorting data')

    log.info('Start send data to user')
    write_data(args, data)
    log.info('End send data to user')
