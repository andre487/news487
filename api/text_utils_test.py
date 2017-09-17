# coding=utf-8
import text_utils

light_html = """
<style>p{margin:0}</style>
<p>Hello <span>world</span>!</p>
<script>alert(1)</script>
"""

heavy_html = """
<head>
    <title>Title</title>
    <style>p{margin:0}</style>
</head>
<body>
    <h1>Test document</h1>
    <p>
        Hello <span>world</span>!
        <img src="foo.jpg" alt="Foo">
    </p>
    <div>
        <article>
            <p>
                <h2>Broken header of</h2>
                <div>
                    <p>Broken paragraph</p>
                </div>
            </p>
        </article>
    </div>
    <script>alert(1)</script>
</body>
"""

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


def test_strip_tags():
    res = text_utils.strip_tags(light_html)

    assert res == 'Hello world!'


def test_meaning_extractor_parsing():
    parser = text_utils.MeaningExtractor()
    parser.feed(heavy_html)

    data = parser.get_data()

    assert 'title' in data
    assert 'h1' in data
    assert 'p' in data
    assert 'img' in data

    assert data['title'][0]['content'] == 'Title'
    assert data['h1'][0]['content'] == 'Test document'

    assert data['p'][0]['content'] == 'Hello world!'
    assert data['p'][1]['content'] == 'Broken header of Broken paragraph'

    assert data['img'][0]['src'] == 'foo.jpg'
    assert data['img'][0]['alt'] == 'Foo'


def test_meaning_extractor_title_yes():
    parser = text_utils.MeaningExtractor()
    parser.feed(heavy_html)

    assert parser.get_title() == 'Title'


def test_meaning_extractor_title_no():
    parser = text_utils.MeaningExtractor()
    parser.feed(light_html)

    assert parser.get_title() is None


def test_meaning_extractor_header_yes():
    parser = text_utils.MeaningExtractor()
    parser.feed(heavy_html)

    assert parser.get_header() == 'Test document'


def test_meaning_extractor_header_no():
    parser = text_utils.MeaningExtractor()
    parser.feed(light_html)

    assert parser.get_header() is None


def test_meaning_extractor_description_yes():
    parser = text_utils.MeaningExtractor()
    parser.feed(heavy_html)

    assert parser.get_description() == 'Hello world!'


def test_meaning_extractor_description_no():
    parser = text_utils.MeaningExtractor()
    parser.feed('')

    assert parser.get_description() is None


def test_meaning_extractor_short_description_yes_short():
    parser = text_utils.MeaningExtractor()
    parser.feed(heavy_html)

    assert parser.get_short_description() == 'Hello world!'


def test_meaning_extractor_short_description_yes_long():
    parser = text_utils.MeaningExtractor()
    parser.feed('<p>Heavy metal!!!!!!!!!!!!!!!!!!!!!!!!</p>')

    assert parser.get_short_description(length=32) == u'Heavy metal…'


def test_meaning_extractor_short_description_no():
    parser = text_utils.MeaningExtractor()
    parser.feed('')

    assert parser.get_short_description() is None


def test_meaning_extractor_picture_yes():
    parser = text_utils.MeaningExtractor()
    parser.feed(heavy_html)

    assert parser.get_picture() == 'foo.jpg'


def test_meaning_extractor_picture_no():
    parser = text_utils.MeaningExtractor()
    parser.feed(light_html)

    assert parser.get_picture() is None


def test_replace_email_settings_links():
    res = text_utils.replace_email_settings_links(email_settings_document)

    assert '<a href="http://natribu.org">http://natribu.org</a>' in res
    assert 'unsubscribe' not in res

    assert any(tip not in res for tip in text_utils.change_email_settings_tips)
