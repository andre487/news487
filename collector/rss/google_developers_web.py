import feedparser
import logging

from util import date

feed_url = 'https://developers.google.com/web/updates/atom.xml'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(feed_url)
    data = []

    for entry in feed['entries']:
        pb_date = date.parse(entry['published'])

        data.append({
            'title': entry['title'],
            'description': entry['summary'],
            'link': entry['link'],
            'published': pb_date.strftime('%Y-%m-%dT%H:%M:00'),

            'source_name': 'GoogleDevelopersWeb',
            'source_title': feed['feed']['title'],
            'source_link': feed['feed']['link'],
            'author_name': entry['author'],

            'tags': 'tech,web,' + ','.join(tag['label'].lower() for tag in entry['tags']),
        })

    log.info('Google Developers Web: got %d documents', len(data))

    return data


if __name__ == '__main__':
    print parse()
