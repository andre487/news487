# coding=utf-8
import feedparser
import logging
import re

from datetime import datetime

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

        pb = entry['published_parsed']
        pb_date = datetime(year=pb.tm_year, month=pb.tm_mon, day=pb.tm_mday, hour=pb.tm_hour, minute=pb.tm_min)

        data.append({
            'title': title,
            'description': entry['summary'],
            'link': entry['link'],
            'published': pb_date.strftime('%Y-%m-%dT%H:%M:00'),
            'tags': 'finances',
            'source_name': feed['feed']['title'],
            'source_link': feed['feed']['link'],
            'author_name': author_name,
        })

    log.info('Tinkoff Journal: got %d documents', len(data))

    return data


if __name__ == '__main__':
    print parse()
