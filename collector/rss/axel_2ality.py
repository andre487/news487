import feedparser
import logging

from util import date, tags


SOURCE_NAME = '2ality'
FEED_URL = 'http://feeds.feedburner.com/2ality?format=xml'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        data.append({
            'title': entry['title'],
            'description': entry['summary'],
            'link': entry['feedburner_origlink'],
            'published': date.utc_format(entry['updated']),

            'source_name': SOURCE_NAME,
            'source_type': 'rss',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': 'Dr. Axel Rauschmayer',
            'author_link': 'http://2ality.com/',

            'tags': tags.string_format('tech', 'web', 'js'),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
