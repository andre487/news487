# coding=utf-8
import text_utils

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
    'https://frontendfoc.us/edit_subscription/hash',
    'https://click.e.mozilla.org/?qs=hash',
]

email_settings_document = ''.join([
    '<body>',
    ''.join(
        map(lambda c: '<p><a href="%s">%s</a></p>' % (c, c), change_email_settings_links)
    ),
    '</body>',
])


def test_replace_email_settings_links():
    res = text_utils.replace_email_settings_links(email_settings_document)

    assert '<a href="http://natribu.org">http://natribu.org</a>' in res
    assert 'unsubscribe' not in res

    assert any(tip not in res for tip in text_utils.change_email_settings_tips)


def test_highlight_urls():
    urls = 'http://natribu.org https://yandex.ru/search/touch/?text=cats\n//example.com/res?q=.!.#header'
    expected = (
        '<a href="http://natribu.org">http://natribu.org</a> '
        '<a href="https://yandex.ru/search/touch/?text=cats">https://yandex.ru/search/touch/?text=cats</a>\n'
        '<a href="//example.com/res?q=.!.#header">//example.com/res?q=.!.#header</a>'
    )

    res = text_utils.highlight_urls(urls)

    assert res == expected
