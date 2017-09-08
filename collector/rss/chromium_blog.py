import feedparser
import logging

from util import date, tags


feed_url = 'http://blog.chromium.org/atom.xml'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(feed_url)
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

            'source_name': 'ChromiumBlog',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': author_name,
            'author_link': author_link,

            'tags': tags.string_format('tech', 'web', 'browsers', 'chromium'),
        })

    log.info('Chromium Blog: got %d documents', len(data))

    return data


if __name__ == '__main__':
    print parse()
