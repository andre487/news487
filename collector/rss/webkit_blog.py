from rss import parse_feed_by_url

SOURCE_NAME = 'WebkitBlog'
FEED_URL = 'https://webkit.org/feed/atom/'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'web', 'browsers', 'safari', 'webkit'))


if __name__ == '__main__':
    print parse()
