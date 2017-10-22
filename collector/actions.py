import argparse
import codecs
import logging
import mail.reader as mail
import re
import sys
import twits.reader as twits

from data_extraction import doc_handler, link_handler
from functools import partial
from multiprocessing.pool import ThreadPool
from rss.reader import parse_feed_by_name, sources as rss_sources
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
    run_parser.add_argument('--no-replace-redirects', action='store_true')

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

    names_set = set(args.names)
    if 'all' in names_set:
        rss_handlers = scrappers['rss']
    else:
        rss_handlers = set(scrappers['rss']).intersection(names_set)

    pool = ThreadPool()
    rss_result = pool.map_async(partial(_run_rss_handler, args), rss_handlers)

    twitter_result = None
    if 'twitter' in names_set or 'all' in names_set:
        twitter_result = pool.apply_async(partial(_run_twitter_handler, args))

    mail_result = None
    if 'mail' in names_set or 'all' in names_set:
        mail_result = pool.apply_async(partial(_run_mail_handler, args))

    rss_data = rss_result.get()
    log.info('Got RSS docs')

    twitter_data = twitter_result.get() if twitter_result else []
    log.info('Got Twitter docs')

    mail_data = mail_result.get() if mail_result else []
    log.info('Got Mail docs')

    pool.close()

    docs = twitter_data + mail_data
    for feed_data in rss_data:
        docs += feed_data

    log.info('End scrappers run')

    log.info('Start cleaning urls')
    docs = map(_clean_doc_url, docs)
    log.info('End cleaning urls')

    log.info('Start filtering new docs')
    new_docs = doc_handler.filter_new_docs(docs)
    log.info('End filtering new docs')

    log.info('Start dressing %d docs', len(new_docs))
    pool = ThreadPool()
    new_docs = pool.map(partial(_run_dress_document, args), new_docs)
    pool.close()
    log.info('End dressing docs')

    log.info('Start sorting data')
    new_docs.sort(key=lambda item: item['published'], reverse=True)
    log.info('End sorting data')

    log.info('Start write data')
    write_data(args, new_docs)
    log.info('End write data')


def _run_rss_handler(args, feed):
    try:
        log.info('Start feed handling: %s', feed)
        res = parse_feed_by_name(feed)
        log.info('End feed handling: %s', feed)
        return res
    except Exception as e:
        log.error('Error in %s: %s', feed, e)
        return []


def _run_twitter_handler(args):
    try:
        log.info('Start twitter handling')
        res = twits.parse()
        log.info('End twitter handling')
        return res
    except Exception as e:
        log.error('Error in twitter: %s', e)
        return []


def _run_mail_handler(args):
    try:
        log.info('Start mail handling')
        res = mail.parse(replace_redirects=not args.no_replace_redirects)
        log.info('End mail handling')
        return res
    except Exception as e:
        log.error('Error in mail: %s', e)
        return []


def _clean_doc_url(doc):
    doc['orig_link'] = doc['link']
    doc['link'] = link_handler.clean_url(doc['link'])
    return doc


def _run_dress_document(args, doc):
    return doc_handler.dress_document_with_metadata(doc)
