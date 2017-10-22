# coding=utf-8
import link_handler

change_email_settings_links = [
    'http://tinkoff.us10.list-manage.com/unsubscribe?u=hash&id=hash&c=hash',
    'http://meduza.us10.list-manage1.com/unsubscribe?u=hash&id=hash&e=hash',
    'https://webopsweekly.com/edit_subscription/hash',
    'https://webopsweekly.com/unsubscribe/hash',
    'https://webopsweekly.com/confirm/hash',
    'https://nodeweekly.com/unsubscribe/hash',
    'https://nodeweekly.com/edit_subscription/hash',
    'https://nodeweekly.com/confirm/hash',
    'http://javascriptweekly.us1.list-manage.com/unsubscribe?u=hash&e=hash',
    'https://mobilewebweekly.com/edit_subscription/hash',
    'https://mobilewebweekly.com/unsubscribe/hash',
    'https://frontendfoc.us/unsubscribe/hash',
    'https://frontendfoc.us/edit_subscription/hash#hash',
    'https://nodeweekly.com/leave/hash',
    'https://click.e.mozilla.org/?qs=hash',
    'https://www.mozilla.org/newsletter/existing/hash/',
    'https://click.e.mozilla.org/?qs=hash%20hash2',
    'https://www.mozilla.org/newsletter/existing/hash/index.html#anchor',
]

email_settings_document = ''.join([
    '<!DOCTYPE HTML PUBLIC  "-//W3C//DTD HTML 4.01//EN" "www.w3.org/TR/html4/strict.dtd">',
    '<body>',
    ''.join(
        map(lambda c: '<p><a href="%s">%s</a></p>' % (c, c), change_email_settings_links)
    ),
    '</body>',
])


def test_extract_all_links():
    res = link_handler.extract_all_links(email_settings_document)

    for link in change_email_settings_links:
        assert link in res

    for link in res:
        assert link in change_email_settings_links


def test_replace_email_settings_links():
    res = link_handler.replace_email_settings_links(email_settings_document)

    assert '<a href="http://natribu.org">http://natribu.org</a>' in res

    for pattern in link_handler.change_email_settings_tips:
        assert pattern not in res

    assert any(tip not in res for tip in link_handler.change_email_settings_tips)


def test_highlight_urls():
    urls = 'http://natribu.org https://yandex.ru/search/touch/?text=cats\n//example.com/res?q=.!.#header'
    expected = (
        '<a href="http://natribu.org">http://natribu.org</a> '
        '<a href="https://yandex.ru/search/touch/?text=cats">https://yandex.ru/search/touch/?text=cats</a>\n'
        '<a href="//example.com/res?q=.!.#header">//example.com/res?q=.!.#header</a>'
    )

    res = link_handler.highlight_urls(urls)

    assert res == expected


def test_clean_url_utm_params():
    url = (
        'https://developers.google.com/web/updates/2016/10/navigator-share?'
        'utm_source=feed&foo=bar&utm_medium=feed&utm_campaign=updates_feed'
    )

    res = link_handler.clean_url(url)

    assert res == 'https://developers.google.com/web/updates/2016/10/navigator-share?foo=bar'


def test_clean_url_from_rss():
    url = (
        'https://developers.google.com/web/updates/2016/10/navigator-share?'
        'source=rss&utm_source=feed&utm_medium=feed&utm_campaign=updates_feed&from=rss&foo=bar'
    )

    res = link_handler.clean_url(url)

    assert res == 'https://developers.google.com/web/updates/2016/10/navigator-share?foo=bar'


def test_clean_url_trailing_question():
    url = (
        'https://developers.google.com/web/updates/2016/10/navigator-share?'
        'utm_source=feed&utm_medium=feed&utm_campaign=updates_feed&from=rss'
    )

    res = link_handler.clean_url(url)

    assert res == 'https://developers.google.com/web/updates/2016/10/navigator-share'
