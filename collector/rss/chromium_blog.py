import feedparser
import logging

from util import date, tags


SOURCE_NAME = 'ChromiumBlog'
FEED_URL = 'http://blog.chromium.org/atom.xml'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        author_name = ''
        author_link = ''

        if 'authors' in entry and len(entry['authors']):
            author = entry['authors'][0]

            author_name = author['name']
            author_link = author['href']

        data.append({
            'title': entry['title'],
            'description': entry['summary'],
            'picture': entry['gd_image']['src'],
            'link': entry['link'],
            'published': date.utc_format(entry['published']),

            'source_name': SOURCE_NAME,
            'source_type': 'rss',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': author_name,
            'author_link': author_link,

            'tags': tags.string_format('tech', 'web', 'browsers', 'chromium'),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
