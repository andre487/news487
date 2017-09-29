from rss import parse_feed_by_url

SOURCE_NAME = 'PerformanceCalendar'
FEED_URL = 'https://calendar.perfplanet.com/feed/'


def parse():
    return parse_feed_by_url(SOURCE_NAME, FEED_URL, additional_tags=('tech', 'web', 'perf'))


if __name__ == '__main__':
    print parse()
