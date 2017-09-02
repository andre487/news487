import argparse
import json
import os
import re

from os import path
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
        'spiders': [],
    }
    base_dir = path.join(path.dirname(__file__), '..')

    for root, dirs, files in os.walk(path.join(base_dir, 'spiders')):
        spider_files = [get_file_name(name) for name in files if not name.startswith('_') and name.endswith('.py')]
        scrappers['spiders'] = spider_files

    scrappers['all'] = scrappers['spiders']
    return scrappers


def send_data(args, data):
    json_data = json.dumps(data, ensure_ascii=False, indent=2)

    if args.file is None:
        print json_data
    else:
        open(args.output, 'w').write(json_data)


def get_file_name(name):
    matches = file_name_getter.match(name)
    if not matches:
        raise ValueError('Wrong scrapper file name: %s' % name)
    return matches.group(1)


def run_scrappers(args, scrappers):
    data = []

    for spider in scrappers['spiders']:
        data += run_spider_by_name(spider)

    send_data(args, data)
