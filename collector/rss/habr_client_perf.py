# coding=utf-8
import feedparser
import logging

from util import date, tags

SOURCE_NAME = 'Habrahabr'
FEED_URL = 'https://habrahabr.ru/rss/hub/client_side_optimization/all/'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        data.append({
            'title': entry['title'],
            'description': entry['description'],
            'link': entry['link'],
            'published': date.utc_format(entry['published']),

            'source_name': SOURCE_NAME,
            'source_type': 'rss',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': entry['author'],

            'tags': tags.string_format('tech', 'habr', 'web', 'perf'),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
