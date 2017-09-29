from rss import parse_feed_by_url

SOURCE_NAME = 'igvita'
FEED_URL = 'http://feeds.igvita.com/igvita'


def parse():
    return parse_feed_by_url(
        SOURCE_NAME, FEED_URL,
        additional_tags=('tech', 'web', 'perf'),
        author_name='Ilya Grigorik',
        author_link='https://www.igvita.com/',
    )


if __name__ == '__main__':
    print parse()
