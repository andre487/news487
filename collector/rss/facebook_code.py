from rss import parse_feed_by_url

SOURCE_NAME = 'FacebookCode'
FEED_URL = 'https://code.facebook.com/posts/rss'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'services', 'facebook'))


if __name__ == '__main__':
    print parse()
