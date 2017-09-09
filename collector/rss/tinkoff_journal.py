# coding=utf-8
import feedparser
import logging
import re

from util import date, tags

SOURCE_NAME = 'TinkoffJournal'
FEED_URL = 'https://journal.tinkoff.ru/feed/atom/'

log = logging.getLogger('app')

title_parser = re.compile(r'^([\w\s]+): .+', re.UNICODE)


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        title = entry['title']
        author_name = entry['author']

        title_matches = title_parser.match(title)
        if title_matches:
            author_name = title_matches.group(1)

        data.append({
            'title': title,
            'description': entry['summary'],
            'link': entry['link'],
            'published': date.utc_format(entry['published']),

            'source_name': SOURCE_NAME,
            'source_type': 'rss',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': author_name,
            'tags': tags.string_format('finances', 'no_tech'),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
