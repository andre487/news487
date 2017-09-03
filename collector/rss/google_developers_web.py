import feedparser
import logging

from datetime import datetime

feed_url = 'https://developers.google.com/web/updates/atom.xml'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(feed_url)
    data = []

    for entry in feed['entries']:
        pb = entry['published_parsed']
        pb_date = datetime(year=pb.tm_year, month=pb.tm_mon, day=pb.tm_mday, hour=pb.tm_hour, minute=pb.tm_min)

        data.append({
            'title': entry['title'],
            'description': entry['summary'],
            'link': entry['link'],
            'published': pb_date.strftime('%Y-%m-%dT%H:%M:00'),
            'tags': 'tech,web,' + ','.join(tag['label'].lower() for tag in entry['tags']),
            'source_name': feed['feed']['title'],
            'source_link': feed['feed']['link'],
            'author_name': entry['author'],
        })

    log.info('%s: got %d documents', feed['feed']['title'], len(data))

    return data


if __name__ == '__main__':
    print parse()
