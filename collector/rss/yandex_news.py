# coding=utf-8
import feedparser
import logging
import re

from util import date, tags

SOURCE_NAME = 'YandexNews'
FEED_URL = 'https://news.yandex.ru/index.rss'

log = logging.getLogger('app')

author_name_parser = re.compile(r'.+yandsearch\?cl4url=.*?([\w.-]+).+', re.UNICODE)


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        author_name = ''
        author_link = ''

        matches = author_name_parser.match(entry['link'])
        if matches:
            author_link = author_name = matches.group(1)
            if not author_link.startswith('http'):
                author_link = 'http://' + author_link

        data.append({
            'title': entry['title'],
            'description': entry['description'],
            'link': entry['link'],
            'published': date.utc_format(entry['published']),

            'source_name': SOURCE_NAME,
            'source_type': 'rss',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': author_name,
            'author_link': author_link,

            'tags': tags.string_format('world', 'no_tech'),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
