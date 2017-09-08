import feedparser
import logging

from util import date, tags

SOURCE_NAME = 'Google Developers Web'
FEED_URL = 'https://developers.google.com/web/updates/atom.xml'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        data.append({
            'title': entry['title'],
            'description': entry['summary'],
            'link': entry['link'],
            'published': date.utc_format(entry['published']),

            'source_name': SOURCE_NAME,
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': entry['author'],

            'tags': tags.string_format('tech', 'web', *(tag['label'].lower() for tag in entry['tags'])),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
