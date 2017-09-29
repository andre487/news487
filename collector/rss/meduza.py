# coding=utf-8
from rss import parse_feed_by_url

SOURCE_NAME = 'Meduza'
FEED_URL = 'https://meduza.io/rss/all'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('world', 'no_tech', 'meduza'))


if __name__ == '__main__':
    print parse()
