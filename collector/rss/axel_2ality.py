from rss import parse_feed_by_url

SOURCE_NAME = '2ality'
FEED_URL = 'http://feeds.feedburner.com/2ality?format=xml'


def parse():
    return parse_feed_by_url(
        SOURCE_NAME,
        FEED_URL,
        additional_tags=('tech', 'web', 'js'),
        author_name='Dr. Axel Rauschmayer',
        author_link='http://2ality.com/',
    )


if __name__ == '__main__':
    print parse()
