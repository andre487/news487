import logging
import os
import re
import twitter

from util import date, tags

SOURCE_NAME = 'Twitter'

ADDITIONAL_LISTS = [{
    'id': 228258082,
    'tags': ['tech', 'perf'],
}]

log = logging.getLogger('app')

_tags_matcher = re.compile('(?:.|\n)*tags:\s*([^\n]+)')


def parse():
    consumer_key = os.environ.get('TWITTER_CONSUMER_KEY') \
                   or os.environ.get('TWITTER_SCRAPPER_487_CONSUMER_KEY')
    consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET') \
                      or os.environ.get('TWITTER_SCRAPPER_487_CONSUMER_SECRET')
    access_token_key = os.environ.get('TWITTER_ACCESS_TOKEN_KEY') \
                       or os.environ.get('TWITTER_SCRAPPER_487_ACCESS_TOKEN_KEY')
    access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET') \
                          or os.environ.get('TWITTER_SCRAPPER_487_ACCESS_TOKEN_SECRET')

    if not consumer_key or not consumer_secret or not access_token_key or not access_token_secret:
        raise Exception(
            'For using Twitter you should provide env: '
            'TWITTER_ACCESS_TOKEN_KEY TWITTER_ACCESS_TOKEN_SECRET '
            'TWITTER_CONSUMER_KEY TWITTER_CONSUMER_SECRET'
        )

    api = twitter.Api(
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
        access_token_key=access_token_key,
        access_token_secret=access_token_secret,
    )

    all_lists = api.GetListsList()
    lists_to_scrap = ADDITIONAL_LISTS[:]

    for list_info in all_lists:
        if '__get__' in list_info.description:
            lists_to_scrap.append({
                'id': list_info.id,
                'tags': parse_tags(list_info.description)
            })

    data = []
    for list_info in lists_to_scrap:
        list_timeline = api.GetListTimeline(list_info['id'])
        for status in list_timeline:
            author_link = 'https://twitter.com/%s' % status.user.screen_name
            doc_link = '%s/status/%s' % (author_link, status.id_str)

            # noinspection PyArgumentList
            data.append({
                'title': status.text,
                'description': '',
                'link': doc_link,

                'published': date.utc_format(status.created_at),

                'source_name': SOURCE_NAME,
                'source_type': 'twitter',
                'source_title': 'Twitter',
                'source_link': 'https://twitter.com',

                'author_name': status.user.name,
                'author_link': author_link,

                'tags': tags.create_tags_list('twitter', *list_info['tags']),

                'share_count': status.retweet_count,
                'favorite_count': status.favorite_count,
            })

    log.info('Twitter: got %d documents', len(data))

    return data


def parse_tags(description):
    matches = _tags_matcher.match(description)
    if not matches:
        return []

    return [tag.strip() for tag in matches.group(1).split(',')]


if __name__ == '__main__':
    parse()
