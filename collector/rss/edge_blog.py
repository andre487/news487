from rss import parse_feed_by_url

SOURCE_NAME = 'EdgeBlog'
FEED_URL = 'https://blogs.windows.com/msedgedev/feed/'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'web', 'browsers', 'edge'))


if __name__ == '__main__':
    print parse()
