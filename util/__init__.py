import argparse
import json
import os
import re

from os import path
from rss import parse_feed_by_name
from spiders import run_spider_by_name

file_name_getter = re.compile(r'(.+?)\.py')


def get_cli_args(scrappers=None):
    if scrappers is None:
        scrappers = get_scrappers()

    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('--file', dest='file', help='Output file')

    action_parsers = arg_parser.add_subparsers(dest='action', help='Actions')

    run_parser = action_parsers.add_parser('run', help='Run scrappers')
    run_parser.add_argument('names', nargs='+', choices=scrappers['all'])

    action_parsers.add_parser('list', help='List scrappers')

    args = arg_parser.parse_args()
    return args


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

    scrappers['all'] = scrappers['rss'] + scrappers['spiders']
    return scrappers


def send_data(args, data):
    json_data = json.dumps(data, indent=2)

    if args.file is None:
        print json_data
    else:
        open(args.output, 'w').write(json_data)


def get_scrapper_files(files):
    return [get_file_name(name) for name in files if not name.startswith('_') and name.endswith('.py')]


def get_file_name(name):
    matches = file_name_getter.match(name)
    if not matches:
        raise ValueError('Wrong scrapper file name: %s' % name)
    return matches.group(1)


def run_scrappers(args, scrappers):
    data = []
    names_set = set(args.names)

    for feed in set(scrappers['rss']).intersection(names_set):
        data += parse_feed_by_name(feed)

    for spider in set(scrappers['spiders']).intersection(names_set):
        data += run_spider_by_name(spider)

    data.sort(key=lambda item: item['published'], reverse=True)

    send_data(args, data)
