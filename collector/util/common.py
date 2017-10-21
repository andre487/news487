import argparse
import codecs
import logging
import mail
import re
import sys
import twits

from data_extraction import doc_handler
from multiprocessing.pool import ThreadPool
from rss import parse_feed_by_name, sources as rss_sources
from util.write import write_data

file_name_getter = re.compile(r'(.+?)\.py')

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


def get_cli_args(scrappers=None):
    if scrappers is None:
        scrappers = get_scrappers()

    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('--log-level', default=logging.INFO)
    arg_parser.add_argument('--unicode-json', action='store_true')

    action_parsers = arg_parser.add_subparsers(dest='action', help='Actions')

    run_parser = action_parsers.add_parser('run', help='Run scrappers')
    run_parser.add_argument('names', nargs='+', choices=scrappers['all'])

    action_parsers.add_parser('list', help='List scrappers')

    args = arg_parser.parse_args()
    return args


def parse_host_arg(value):
    matches = re.match(r'^((?:[\w-]+)|(?:\d+\.\d+\.\d+\.\d+))(?::(\d+))?$', value)
    if not matches:
        raise argparse.ArgumentTypeError('Wrong host value: %s' % value)

    return {
        'host': matches.group(1),
        'port': int(matches.group(2) or 0),
    }


def setup(args):
    log.setLevel(args.log_level)


def get_scrappers():
    scrappers = {'rss': rss_sources.get_source_names()}

    scrappers['all'] = ['all'] + sorted(['twitter', 'mail'] + scrappers['rss'])
    return scrappers


def run_scrappers(args, scrappers):
    log.info('Start scrappers run')

    docs = []
    names_set = set(args.names)

    if 'all' in names_set:
        rss_handlers = scrappers['rss']
    else:
        rss_handlers = set(scrappers['rss']).intersection(names_set)

    def handlers_callback(res):
        flat_res = []
        for item in res:
            flat_res += item

        for item in flat_res:
            docs.append(item)

    pool = ThreadPool()
    pool.map_async(_run_rss_handler, rss_handlers, callback=handlers_callback)

    if 'twitter' in names_set or 'all' in names_set:
        pool.apply_async(_run_twitter_handler, callback=handlers_callback)

    if 'mail' in names_set or 'all' in names_set:
        pool.apply_async(_run_mail_handler, callback=handlers_callback)

    pool.close()
    pool.join()

    log.info('End scrappers run')

    new_docs = doc_handler.filter_new_docs(docs)
    new_dressed_docs = []

    def dress_callback(res):
        for doc in res:
            new_dressed_docs.append(doc)

    log.info('Start dressing %d docs', len(new_docs))
    pool = ThreadPool()
    pool.map_async(doc_handler.dress_document_with_metadata, new_docs, callback=dress_callback)

    pool.close()
    pool.join()

    log.info('End dressing docs')

    log.info('Start sorting data')
    new_dressed_docs.sort(key=lambda item: item['published'], reverse=True)
    log.info('End sorting data')

    log.info('Start write data')
    write_data(args, new_dressed_docs)
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


def _run_twitter_handler():
    try:
        log.info('Start twitter handling')
        res = twits.parse()
        log.info('End twitter handling')
        return [res]
    except Exception as e:
        log.error('Error in twitter: %s', e)
        return []


def _run_mail_handler():
    try:
        log.info('Start mail handling')
        res = mail.parse()
        log.info('End mail handling')
        return [res]
    except Exception as e:
        log.error('Error in mail: %s', e)
        return []
