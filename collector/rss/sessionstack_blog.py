from rss import parse_feed_by_url

SOURCE_NAME = 'SessionStackBlog'
FEED_URL = 'https://blog.sessionstack.com/feed'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'web'))


if __name__ == '__main__':
    print parse()
