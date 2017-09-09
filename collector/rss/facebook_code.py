import feedparser
import logging

from util import date, tags


SOURCE_NAME = 'FacebookCode'
FEED_URL = 'https://code.facebook.com/posts/rss'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        author_name = ''

        if 'authors' in entry and len(entry['authors']):
            author = entry['authors'][0]
            author_name = author['name']

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

            'tags': tags.string_format('tech', 'services', 'facebook'),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
