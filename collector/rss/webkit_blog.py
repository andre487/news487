import feedparser
import logging

from util import date, tags


SOURCE_NAME = 'WebkitBlog'
FEED_URL = 'https://webkit.org/feed/atom/'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(FEED_URL)
    data = []

    for entry in feed['entries']:
        author_name = ''
        text = ''
        additional_tags = []

        if 'authors' in entry and entry['authors']:
            author_name = entry['authors'][0]['name']

        if 'content' in entry and entry['content']:
            text = entry['content'][0]['value']

        if 'tags' in entry and entry['tags']:
            additional_tags = [tag['term'] for tag in entry['tags']]

        data.append({
            'title': entry['title'],
            'description': entry['description'],
            'text': text,

            'link': entry['link'],
            'published': date.utc_format(entry['published']),

            'source_name': SOURCE_NAME,
            'source_type': 'rss',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],

            'author_name': author_name,

            'tags': tags.string_format('tech', 'web', 'browsers', 'safari', 'webkit', *additional_tags),
        })

    log.info('%s: got %d documents', SOURCE_NAME, len(data))

    return data


if __name__ == '__main__':
    print parse()
