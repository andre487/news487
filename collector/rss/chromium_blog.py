import feedparser
import logging

from datetime import datetime

feed_url = 'http://blog.chromium.org/atom.xml'

log = logging.getLogger('app')


def parse():
    feed = feedparser.parse(feed_url)
    data = []

    for entry in feed['entries']:
        pb = entry['published_parsed']
        pb_date = datetime(year=pb.tm_year, month=pb.tm_mon, day=pb.tm_mday, hour=pb.tm_hour, minute=pb.tm_min)

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
            'tags': 'tech,web,browsers,chromium',
            'published': pb_date.strftime('%Y-%m-%dT%H:%M:00'),
            'source_name': feed['feed']['title'],
            'source_link': feed['feed']['link'],
            'author_name': author_name,
            'author_link': author_link,
        })

    log.info('%s: got %d documents', feed['feed']['title'], len(data))

    return data


if __name__ == '__main__':
    print parse()
