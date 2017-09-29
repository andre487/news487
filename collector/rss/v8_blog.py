from rss import parse_feed_by_url

SOURCE_NAME = 'V8Blog'
FEED_URL = 'https://v8project.blogspot.com/feeds/posts/default'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'web', 'browsers', 'js', 'chromium'))


if __name__ == '__main__':
    print parse()
