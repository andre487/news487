import feedparser
import logging

from rss import sources
from util import date, dict_tool, tags

log = logging.getLogger('app')


def parse_feed_by_name(name):
    feed_params = sources.get_source(name)
    if not feed_params:
        raise ValueError('There is no feed with name %s' % name)

    return parse_feed_by_url(
        feed_params['name'], feed_params['url'],
        additional_tags=feed_params.get('tags', ()),
        author_name=feed_params.get('author_name'),
        author_link=feed_params.get('author_link'),
    )


def parse_feed_by_url(source_name, feed_url, additional_tags=(), author_name=None, author_link=None):
    default_author_name = author_name
    default_author_link = author_link

    feed = feedparser.parse(feed_url)
    data = []

    for entry in feed['entries']:
        data.append(
            create_doc(source_name, feed, entry, additional_tags, default_author_name, default_author_link)
        )

    log.info('%s: got %d documents', source_name, len(data))

    return data


def create_doc(source_name, feed, entry, additional_tags, default_author_name, default_author_link):
    link = dict_tool.get_alternative(entry, 'feedburner_origlink', 'link', assert_val=True)

    published = date.utc_format(
        dict_tool.get_alternative(entry, 'published', 'updated', assert_val=True)
    )

    description = dict_tool.get_alternative(entry, 'summary', 'description', assert_val=True)
    picture = dict_tool.get_deep(entry, 'gd_image', 'src')
    text = dict_tool.get_deep(entry, 'content', 0, 'value')

    author_name = handle_default_param(
        entry,
        dict_tool.get_deep(entry, 'authors', 0, 'name'),
        default_author_name
    )
    author_link = handle_default_param(
        entry,
        dict_tool.get_deep(entry, 'authors', 0, 'href'),
        default_author_link
    )

    entry_tags = []

    for tag in entry.get('tags', []):
        tag_text = dict_tool.get_alternative(tag, 'term', 'label')
        if tag_text:
            entry_tags.append(tag_text.lower())

    additional_tags += tuple(entry_tags)

    comments_count = entry.get('slash_comments')
    if comments_count is not None:
        comments_count = int(comments_count)

    return {
        'link': link,
        'title': entry['title'],
        'published': published,
        'picture': picture,

        'author_name': author_name,
        'author_link': author_link,

        'description': description,
        'text': text,

        'source_name': source_name,
        'source_type': 'rss',
        'source_title': feed['feed']['title'],
        'source_link': feed['feed']['link'],

        'comments_count': comments_count,

        'tags': tags.create_tags_list(*additional_tags),
    }


def handle_default_param(entry, val, default_val):
    if callable(default_val):
        return default_val(entry, val)

    return val or default_val
