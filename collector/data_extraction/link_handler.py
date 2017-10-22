# coding=utf-8
import logging
import random
import re
import requests
import time

from data_extraction.params import REQUEST_HEADERS

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

url_pattern = re.compile(
    r'(?:https?:)?//(?:(?:[\w-]+\.)+[\w/#@~.-]*)(?:\?(?:[\w&=.!,;$#%-]+)?)?',
    re.UNICODE | re.IGNORECASE
)

garbage_params_pattern = re.compile(r'(?:&?utm_[^&]+)|(?:&?from=rss)|(?:&?source=rss)')
double_amp_pattern = re.compile(r'&&')
leading_amp_pattern = re.compile(r'\?&')


def extract_all_links(html):
    return url_pattern.findall(html)


def replace_redirects(text):
    return url_pattern.sub(_redirect_replacer, text)


def _redirect_replacer(match):
    url = match.group(0)

    if is_local_link(url):
        return url

    for tip in no_redir_tips:
        if tip in url:
            return url

    timeout = random.randint(10, 100) / 1000.0
    time.sleep(timeout)

    res = requests.head(url, headers=REQUEST_HEADERS, allow_redirects=True)

    if res.status_code == 200 and res.url != url:
        log.info('Replace redirect: %s -> %s', url, res.url)
        return res.url
    elif res.status_code != 200:
        log.warn('Got code %d from redirect request', res.status_code)

    return url


def is_local_link(url):
    return url.startswith('/') and not url.startswith('//')


def replace_email_settings_links(html):
    return url_pattern.sub(_email_settings_replacer, html)


def _email_settings_replacer(match):
    url = match.group(0)
    if any(tip in url for tip in change_email_settings_tips):
        return 'http://natribu.org'
    return url


def highlight_urls(html):
    return url_pattern.sub(_url_highlighter, html)


def _url_highlighter(match):
    url = match.group(0)
    return '<a href="{url}">{url}</a>'.format(url=url)


def clean_url(url):
    url = garbage_params_pattern.sub('', url)
    url = leading_amp_pattern.sub('?', url)
    url = double_amp_pattern.sub('&', url)

    if url.endswith('?'):
        url = url[:-1]

    return url
