import random

USER_AGENTS = (
    ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) '
     'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36'),
    ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) '
     'AppleWebKit/537.36 (KHTML, like Gecko) '
     'Chrome/60.0.3112.113 YaBrowser/17.9.1.888 Yowser/2.5 Safari/537.36'),
    ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) '
     'AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38'),
    ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) '
     'AppleWebKit/605.1.10 (KHTML, like Gecko) Version/11.1 Safari/605.1.10'),
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:56.0) Gecko/20100101 Firefox/56.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:57.0) Gecko/20100101 Firefox/57.0',
    ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) '
     'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.55'),
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
    'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
    ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
     'Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'),
)

REQUEST_HEADERS = {
    'User-Agent': random.choice(USER_AGENTS),
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
}
