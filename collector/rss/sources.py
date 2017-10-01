import re

_tinkoff_title_parser = re.compile(r'^([\w\s]+): .+', re.UNICODE)
_ya_news_author_name_parser = re.compile(r'.+yandsearch\?cl4url=.*?([\w.-]+).+', re.UNICODE)


def parse_tinkoff_author_name(entry, author_name):
    if author_name and author_name != 'journal@tinkoff.ru':
        return author_name

    title_matches = _tinkoff_title_parser.match(entry['title'])
    if title_matches:
        return title_matches.group(1)

    return author_name


def ya_news_parse_author_name(entry, author_name):
    if author_name:
        return author_name

    matches = _ya_news_author_name_parser.match(entry['link'])
    if matches:
        return matches.group(1)


def ya_news_parse_author_link(entry, author_link):
    if author_link:
        return author_link

    matches = _ya_news_author_name_parser.match(entry['link'])
    if matches:
        author_link = matches.group(1)
        if not author_link.startswith('http'):
            author_link = 'http://' + author_link
        return author_link


# noinspection SpellCheckingInspection
FEEDS = {
    'axel_2ality': {
        'name': '2ality',
        'url': 'http://feeds.feedburner.com/2ality?format=xml',
        'tags': ('tech', 'web', 'js'),
        'author_name': 'Dr. Axel Rauschmayer',
        'author_link': 'http://2ality.com/',
    },
    'chromium_blog': {
        'name': 'ChromiumBlog',
        'url': 'http://blog.chromium.org/atom.xml',
        'tags': ('tech', 'web', 'browsers', 'chromium'),
    },
    'css_tricks': {
        'name': 'CssTricks',
        'url': 'http://feeds.feedburner.com/CssTricks',
        'tags': ('tech', 'web', 'browsers', 'css'),
    },
    'edge_blog': {
        'name': 'EdgeBlog',
        'url': 'https://blogs.windows.com/msedgedev/feed/',
        'tags': ('tech', 'web', 'browsers', 'edge'),
    },
    'facebook_code': {
        'name': 'FacebookCode',
        'url': 'https://code.facebook.com/posts/rss',
        'tags': ('tech', 'services', 'facebook'),
    },
    'google_developers_web': {
        'name': 'GoogleDevelopersWeb',
        'url': 'https://developers.google.com/web/updates/atom.xml',
        'tags': ('tech', 'web'),
    },
    'habr_client_perf': {
        'name': 'Habrahabr',
        'url': 'https://habrahabr.ru/rss/hub/client_side_optimization/all/',
        'tags': ('tech', 'habr', 'web', 'perf'),
    },
    'igvita': {
        'name': 'igvita',
        'url': 'http://feeds.igvita.com/igvita',
        'tags': ('tech', 'web', 'perf'),
        'author_name': 'Ilya Grigorik',
        'author_link': 'https://www.igvita.com/',
    },
    'meduza': {
        'name': 'Meduza',
        'url': 'https://meduza.io/rss/all',
        'tags': ('world', 'no_tech', 'meduza'),
    },
    'mozilla_hacks': {
        'name': 'MozillaHacks',
        'url': 'https://hacks.mozilla.org/feed/',
        'tags': ('tech', 'services', 'mozilla'),
    },
    'perf_calendar': {
        'name': 'PerformanceCalendar',
        'url': 'https://calendar.perfplanet.com/feed/',
        'tags': ('tech', 'web', 'perf'),
    },
    'radio_t_news': {
        'name': 'RadioTNews',
        'url': 'https://news.radio-t.com/rss',
        'tags': ('tech', 'services'),
        'disabled': True,
    },
    'reddit_perf': {
        'name': 'Reddit',
        'url': 'https://www.reddit.com/r/perfmatters/.rss',
        'tags': ('tech', 'web', 'perf'),
    },
    'search_engines': {
        'name': 'SearchEngines',
        'url': 'https://www.searchengines.ru/feed',
        'tags': ('tech', 'search', 'services'),
    },
    'sessionstack_blog': {
        'name': 'SessionStackBlog',
        'url': 'https://blog.sessionstack.com/feed',
        'tags': ('tech', 'web'),
    },
    'sitepoint': {
        'name': 'SitePoint',
        'url': 'https://www.sitepoint.com/feed/',
        'tags': ('tech', 'web'),
    },
    'tinkoff_journal': {
        'name': 'TinkoffJournal',
        'url': 'https://journal.tinkoff.ru/feed/atom/',
        'tags': ('finances', 'no_tech'),
        'author_name': parse_tinkoff_author_name,
    },
    'v8_blog': {
        'name': 'V8Blog',
        'url': 'https://v8project.blogspot.com/feeds/posts/default',
        'tags': ('tech', 'web', 'browsers', 'js', 'chromium'),
    },
    'webkit_blog': {
        'name': 'WebkitBlog',
        'url': 'https://webkit.org/feed/atom/',
        'tags': ('tech', 'web', 'browsers', 'safari', 'webkit'),
    },
    'web_standards': {
        'name': 'WebStandards',
        'url': 'https://web-standards.ru/category/news/feed/',
        'tags': ('tech', 'web'),
    },
    'yandex_news': {
        'name': 'YandexNews',
        'url': 'https://news.yandex.ru/index.rss',
        'tags': ('world', 'no_tech'),
        'author_name': ya_news_parse_author_name,
        'author_link': ya_news_parse_author_link,
    },
}


def get_source_names():
    return [key for key, val in FEEDS.iteritems() if not val.get('disabled')]


def get_source(name):
    feed_params = FEEDS.get(name)

    if feed_params and not feed_params.get('disabled'):
        return feed_params


def get_sources():
    return {k: v for k, v in FEEDS.iteritems() if not v.get('disabled')}
