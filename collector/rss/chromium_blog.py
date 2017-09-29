from rss import parse_feed_by_url

SOURCE_NAME = 'ChromiumBlog'
FEED_URL = 'http://blog.chromium.org/atom.xml'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'web', 'browsers', 'chromium'))


if __name__ == '__main__':
    print parse()
