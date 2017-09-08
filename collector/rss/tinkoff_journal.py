# coding=utf-8
import feedparser
import logging
import re

from util import date, tags

feed_url = 'https://journal.tinkoff.ru/feed/atom/'

log = logging.getLogger('app')

title_parser = re.compile(r'^([\w\s]+): .+', re.UNICODE)


def parse():
    feed = feedparser.parse(feed_url)
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

            'source_name': 'TinkoffJournal',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': author_name,
            'tags': tags.string_format('finances'),
        })

    log.info('Tinkoff Journal: got %d documents', len(data))

    return data


if __name__ == '__main__':
    print parse()
