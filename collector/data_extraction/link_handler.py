# coding=utf-8
import logging
import re
import requests

log = logging.getLogger('app')

change_email_settings_tips = [
    'list-manage',
    'unsubscribe',
    'edit_subscription',
    'edit-subscription',
    'confirm',
    'click.e.mozilla.org',
    '/leave/',
    '/newsletter/existing/',
]

no_redir_tips = [
    'list-manage',
    'unsubscribe',
    'edit_subscription',
    'edit-subscription',
    'confirm',
    '/leave/',
    '/newsletter/existing/',
    'http://www.w3.org/1999/xhtml',
]

_url_finder = re.compile(
    r'(?:https?:)?//(?:(?:[\w-]+\.)+[\w/#@~.-]*)(?:\?(?:[\w&=.!,;$#%-]+)?)?',
    re.UNICODE | re.IGNORECASE
)


def extract_all_links(html):
    return _url_finder.findall(html)


def replace_redirects(html):
    return _url_finder.sub(_redirect_replacer, html)


def _redirect_replacer(match):
    url = match.group(0)

    if is_local_link(url):
        return url

    for tip in no_redir_tips:
        if tip in url:
            return url

    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/60.0.3112.113 YaBrowser/17.9.1.888 Yowser/2.5 Safari/537.36'
        )
    }
    res = requests.get(url, headers=headers, allow_redirects=False)

    if res.is_redirect:
        location = res.headers.get('Location', res.headers.get('location'))
        if location and not is_local_link(location):
            log.info('Replace redirect for email: %s... -> %s...', url[:40], location[:40])
            return location

    return url


def is_local_link(url):
    return url.startswith('/') and not url.startswith('//')


def replace_email_settings_links(html):
    return _url_finder.sub(_email_settings_replacer, html)


def _email_settings_replacer(match):
    url = match.group(0)
    if any(tip in url for tip in change_email_settings_tips):
        return 'http://natribu.org'
    return url


def highlight_urls(html):
    return _url_finder.sub(_url_highlighter, html)


def _url_highlighter(match):
    url = match.group(0)
    return '<a href="{url}">{url}</a>'.format(url=url)
