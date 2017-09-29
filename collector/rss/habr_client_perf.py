# coding=utf-8
from rss import parse_feed_by_url

SOURCE_NAME = 'Habrahabr'
FEED_URL = 'https://habrahabr.ru/rss/hub/client_side_optimization/all/'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'habr', 'web', 'perf'))


if __name__ == '__main__':
    print parse()
