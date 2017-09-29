# coding=utf-8
import re

from rss import parse_feed_by_url

SOURCE_NAME = 'TinkoffJournal'
FEED_URL = 'https://journal.tinkoff.ru/feed/atom/'

title_parser = re.compile(r'^([\w\s]+): .+', re.UNICODE)


def parse():
    return parse_feed_by_url(
        SOURCE_NAME, FEED_URL,
        additional_tags=('finances', 'no_tech'),
        author_name=parse_author_name,
    )


def parse_author_name(entry, author_name):
    if author_name and author_name != 'journal@tinkoff.ru':
        return author_name

    title_matches = title_parser.match(entry['title'])
    if title_matches:
        return title_matches.group(1)

    return author_name


if __name__ == '__main__':
    print parse()
