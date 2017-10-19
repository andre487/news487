# coding=utf-8
import flask
import os
import re

scrapper_api_url = os.environ.get('SCRAPPER_API_URL', 'http://localhost:5000')

change_email_settings_tips = [
    'list-manage',
    'unsubscribe',
    'edit_subscription',
    'edit-subscription',
    'confirm',
    'click.e.mozilla.org',
]

_url_finder = re.compile(
    r'(?:https?:)?//(?:[\w/#@~.-]+)(?:\?(?:[\w&=.!,;$#-]+)?)?',
    re.UNICODE | re.IGNORECASE
)


def get_document_link(doc):
    link = doc.get('link')
    if link is None:
        return None

    if link.startswith('EmailID('):
        link_path = flask.url_for('get_document', id=doc['id'])
        link = scrapper_api_url + link_path

    return link


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
