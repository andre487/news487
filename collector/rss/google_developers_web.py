from rss import parse_feed_by_url

SOURCE_NAME = 'GoogleDevelopersWeb'
FEED_URL = 'https://developers.google.com/web/updates/atom.xml'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'web'))


if __name__ == '__main__':
    print parse()
