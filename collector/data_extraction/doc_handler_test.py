# coding=utf-8
from data_extraction import doc_handler

light_html = """
<style>p{margin:0}</style>
<p>Hello <span>world</span>!</p>
<script>alert(1)</script>
"""

heavy_html = """
<head>
    <title>Title</title>
    <style>p{margin:0}</style>
    <meta name=foo content=bar>
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

og_meta = """
<meta name='og:type' content='OgType'>
<meta name='og:url' content='http://og.url'>
<meta name='og:title' content='OgTitle'>
<meta name='og:description' content='OgDescription'>
<meta name='og:image' content='og-image.png'>
"""

twitter_meta = """
<meta name='twitter:card' content='TwitterCard'>
<meta name='twitter:title' content='TwitterTitle'>
<meta name='twitter:description' content='TwitterDescription'>
<meta name='twitter:image' content='twitter-image.png'>
"""

light_html_og_meta = og_meta + light_html
light_html_twitter_meta = twitter_meta + light_html

heavy_html_with_og_meta = og_meta + heavy_html
heavy_html_with_twitter_meta = twitter_meta + heavy_html


def test_strip_tags():
    res = doc_handler.strip_tags(light_html)

    assert res == 'Hello world!'


def test_meaning_extractor_parsing():
    parser = doc_handler.MeaningExtractor(heavy_html)

    meta_tags_data = parser.get_meta_data()
    content_data = parser.get_content_data()

    assert 'foo' in meta_tags_data
    assert meta_tags_data['foo'] == 'bar'

    assert 'title' in content_data
    assert 'h1' in content_data
    assert 'p' in content_data
    assert 'img' in content_data

    assert content_data['title'][0]['content'] == 'Title'
    assert content_data['h1'][0]['content'] == 'Test document'

    assert content_data['p'][0]['content'] == 'Hello world!'
    assert content_data['p'][1]['content'] == 'Broken header of Broken paragraph'

    assert content_data['img'][0]['src'] == 'foo.jpg'
    assert content_data['img'][0]['alt'] == 'Foo'


def test_meaning_extractor_title_yes():
    parser = doc_handler.MeaningExtractor(heavy_html)

    assert parser.get_title() == 'Title'


def test_meaning_extractor_title_no():
    parser = doc_handler.MeaningExtractor(light_html)

    assert parser.get_title() is None


def test_meaning_extractor_title_no_but_og():
    parser = doc_handler.MeaningExtractor(light_html_og_meta)

    assert parser.get_title() == 'OgTitle'


def test_meaning_extractor_title_no_but_twitter():
    parser = doc_handler.MeaningExtractor(light_html_twitter_meta)

    assert parser.get_title() == 'TwitterTitle'


def test_meaning_extractor_header_yes():
    parser = doc_handler.MeaningExtractor(heavy_html)

    assert parser.get_header() == 'Test document'


def test_meaning_extractor_header_no():
    parser = doc_handler.MeaningExtractor(light_html)

    assert parser.get_header() is None


def test_meaning_extractor_description_og():
    parser = doc_handler.MeaningExtractor(heavy_html_with_og_meta)

    assert parser.get_description() == 'OgDescription'


def test_meaning_extractor_description_twitter():
    parser = doc_handler.MeaningExtractor(heavy_html_with_twitter_meta)

    assert parser.get_description() == 'TwitterDescription'


def test_meaning_extractor_description_from_content():
    parser = doc_handler.MeaningExtractor(heavy_html)

    assert parser.guess_description() == 'Hello world!'


def test_meaning_extractor_description_no():
    parser = doc_handler.MeaningExtractor('')

    assert parser.guess_description() is None


def test_meaning_extractor_short_description_yes_short():
    parser = doc_handler.MeaningExtractor(heavy_html)

    assert parser.guess_short_description() == 'Hello world!'


def test_meaning_extractor_short_description_yes_long():
    parser = doc_handler.MeaningExtractor('<p>Heavy metal!!!!!!!!!!!!!!!!!!!!!!!!</p>')

    assert parser.guess_short_description(length=32) == u'Heavy metal…'


def test_meaning_extractor_short_description_no():
    parser = doc_handler.MeaningExtractor('')

    assert parser.guess_short_description() is None


def test_meaning_extractor_short_description_no_but_og():
    html = '<meta name="og:description" content="Heavy metal!!!!!!!!!!!!!!!!!!!!!!!!">'
    parser = doc_handler.MeaningExtractor(html)

    assert parser.guess_short_description(length=32) == u'Heavy metal…'


def test_meaning_extractor_short_description_no_but_twitter():
    html = '<meta name="twitter:description" content="Heavy metal!!!!!!!!!!!!!!!!!!!!!!!!">'
    parser = doc_handler.MeaningExtractor(html)

    assert parser.guess_short_description(length=32) == u'Heavy metal…'


def test_meaning_extractor_picture_from_og():
    parser = doc_handler.MeaningExtractor(heavy_html_with_og_meta)

    assert parser.get_picture() == 'og-image.png'


def test_meaning_extractor_picture_from_twitter():
    parser = doc_handler.MeaningExtractor(heavy_html_with_twitter_meta)

    assert parser.get_picture() == 'twitter-image.png'


def test_meaning_extractor_picture_from_content():
    parser = doc_handler.MeaningExtractor(heavy_html)

    assert parser.get_picture() == 'foo.jpg'


def test_meaning_extractor_picture_from_content_skip_little():
    parser = doc_handler.MeaningExtractor('<img src=bar.jpg alt=Bar width=10 height=10>' + heavy_html)

    assert parser.get_picture() == 'foo.jpg'


def test_meaning_extractor_picture_from_content_handle_incorrect_sizes():
    parser = doc_handler.MeaningExtractor('<img src=bar.jpg alt=Bar width=10ass height=10ass>' + heavy_html)

    assert parser.get_picture() == 'bar.jpg'


def test_meaning_extractor_picture_from_content_prefere_alt():
    parser = doc_handler.MeaningExtractor('<img src=bar.jpg width=100 height=100>' + heavy_html)

    assert parser.get_picture() == 'foo.jpg'


def test_meaning_extractor_picture_no():
    parser = doc_handler.MeaningExtractor(light_html)

    assert parser.get_picture() is None
