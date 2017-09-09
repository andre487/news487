import os
import re
import twitter

from util import date, tags

_tags_matcher = re.compile('(?:.|\n)*tags:\s*([^\n]+)')

SOURCE_NAME = 'Twitter'

ADDITIONAL_LISTS = [{
    'id': 228258082,
    'tags': ['tech', 'perf'],
}]


def parse():
    consumer_key = os.environ.get('TWITTER_CONSUMER_KEY')
    consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET')
    access_token_key = os.environ.get('TWITTER_ACCESS_TOKEN_KEY')
    access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')

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
        for twit in list_timeline:
            author_link = 'https://twitter.com/%s' % twit.user.screen_name
            doc_link = '%s/status/%s' % (author_link, twit.id_str)

            # noinspection PyArgumentList
            data.append({
                'title': twit.text,
                'description': '',
                'link': doc_link,

                'published': date.utc_format(twit.created_at),

                'source_name': SOURCE_NAME,
                'source_type': 'twitter',
                'source_title': 'Twitter',
                'source_link': 'https://twitter.com',

                'author_name': twit.user.name,
                'author_link': author_link,

                'tags': tags.string_format('twitter', *list_info['tags']),

                'share_count': twit.retweet_count,
                'favorite_count': twit.favorite_count,
            })

    return data


def parse_tags(description):
    matches = _tags_matcher.match(description)
    if not matches:
        return []

    return [tag.strip() for tag in matches.group(1).split(',')]


if __name__ == '__main__':
    parse()
