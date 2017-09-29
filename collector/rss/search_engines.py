# coding=utf-8
from rss import parse_feed_by_url

SOURCE_NAME = 'SearchEngines'
FEED_URL = 'https://www.searchengines.ru/feed'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'search', 'services'))


if __name__ == '__main__':
    print parse()
