from rss import parse_feed_by_url

SOURCE_NAME = 'MozillaHacks'
FEED_URL = 'https://hacks.mozilla.org/feed/'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'services', 'mozilla'))


if __name__ == '__main__':
    print parse()
