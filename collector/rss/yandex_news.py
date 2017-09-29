# coding=utf-8
import re

from rss import parse_feed_by_url

SOURCE_NAME = 'YandexNews'
FEED_URL = 'https://news.yandex.ru/index.rss'

author_name_parser = re.compile(r'.+yandsearch\?cl4url=.*?([\w.-]+).+', re.UNICODE)


def parse():
    return parse_feed_by_url(
        SOURCE_NAME, FEED_URL,
        additional_tags=('world', 'no_tech'),
        author_name=parse_author_name,
        author_link=parse_author_link,
    )


def parse_author_name(entry, author_name):
    if author_name:
        return author_name

    matches = author_name_parser.match(entry['link'])
    if matches:
        return matches.group(1)


def parse_author_link(entry, author_link):
    if author_link:
        return author_link

    matches = author_name_parser.match(entry['link'])
    if matches:
        author_link = matches.group(1)
        if not author_link.startswith('http'):
            author_link = 'http://' + author_link
        return author_link


if __name__ == '__main__':
    print parse()
