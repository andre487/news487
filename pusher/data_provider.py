import json
import logging
import pymongo
import mongo_db
import os
import proj_constants as const
import requests

from datetime import datetime, timedelta

FB_API_URL = 'https://fcm.googleapis.com/fcm/send'

log = logging.getLogger('app')

news_url = os.environ.get('NEWS_MAIN_URL')
fb_server_key = os.environ.get('FIREBASE_SERVER_KEY', os.environ.get('SCRAPPER_487_FIREBASE_SERVER_KEY', '')).strip()
if not fb_server_key:
    raise EnvironmentError('You should provide FIREBASE_SERVER_KEY env var')

_firebase_app = None


class ParamsError(Exception):
    pass


def get_stats():
    return {
        'tokens_count': _get_tokens_collection().count()
    }


def add_token(token):
    token = (token or '').strip()
    if not token:
        raise ParamsError('Token is empty')

    res = request_fb_api({
        'registration_ids': [token]
    })

    if res['code'] != 200 or res['data'].get('success') != 1:
        raise ParamsError('Invalid token')

    collection = _get_tokens_collection()

    collection.create_index([
        ('token', pymongo.ASCENDING),
    ], unique=True, background=True, expireAfterSeconds=31104000)

    doc = {'token': token}
    collection.update_one(doc, {'$set': doc}, upsert=True)


def request_fb_api(data):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'key=' + fb_server_key,
    }

    res = requests.post(FB_API_URL, data=json.dumps(data), headers=headers)
    try:
        data = json.loads(res.text)
    except ValueError:
        data = {}

    return {
        'code': res.status_code,
        'data': data,
    }


def get_docs_count_from_yesterday():
    yesterday = datetime.now() - timedelta(days=1)

    return _get_documents_collection().count({'published': {'$gte': yesterday}})


def push_message_to_all(message, title='News 487'):
    cursor = _get_tokens_collection().find({})
    for item in cursor:
        request_fb_api({
            'to': item['token'],
            'notification': {
                'title': title,
                'body': message,
                'icon': '/icons/512.png',
                'click_action': news_url,
            },
        })


def close_db():
    mongo_db.close()


def _get_tokens_collection():
    client = mongo_db.get_client()
    return client[const.PUSHER_TOKENS_DB][const.PUSHER_TOKENS_COLLECTION]


def _get_documents_collection():
    client = mongo_db.get_client()
    return client[const.NEWS_DB][const.NEWS_COLLECTION]
