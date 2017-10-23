import json
import logging
import pymongo
import os
import requests

from datetime import datetime, timedelta

FB_API_URL = 'https://fcm.googleapis.com/fcm/send'

log = logging.getLogger('app')

news_url = os.environ.get('NEWS_MAIN_URL')
tokens_db_name = os.environ.get('MONGO_TOKENS_DB', 'pusher_data')
docs_db_name = os.environ.get('MONGO_DOCUMENTS_DB', 'news_documents')

fb_server_key = os.environ.get('FIREBASE_SERVER_KEY', os.environ.get('SCRAPPER_487_FIREBASE_SERVER_KEY', '')).strip()
if not fb_server_key:
    raise EnvironmentError('You should provide FIREBASE_SERVER_KEY env var')

_firebase_app = None
_mongo_client = None


class ParamsError(Exception):
    pass


def add_token(token):
    token = (token or '').strip()
    if not token:
        raise ParamsError('Token is empty')

    res = request_fb_api({
        'registration_ids': [token]
    })

    if res['code'] != 200 or res['data'].get('success') != 1:
        raise ParamsError('Invalid token')

    db = _get_mongo_client()[tokens_db_name]
    collection = db.get_collection('tokens')

    collection.create_index([
        ('token', pymongo.ASCENDING),
    ], unique=True, background=True, expireAfterSeconds=31104000)

    doc = {'token': token}
    collection.update_one(doc, {'$set': doc}, upsert=True)


def remove_token(token):
    db = _get_mongo_client()[tokens_db_name]
    collection = db.get_collection('tokens')

    collection.delete_one({'token': token})


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

    db = _get_mongo_client()[docs_db_name]

    return db.get_collection('items').find({'published': {'$gte': yesterday}}).count()


def push_message_to_all(message, title='News 487'):
    db = _get_mongo_client()[tokens_db_name]

    cursor = db.get_collection('tokens').find({})
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


def _get_mongo_client():
    global _mongo_client

    if _mongo_client:
        return _mongo_client

    host = os.environ.get('MONGO_HOST', 'localhost')
    port = int(os.environ.get('MONGO_PORT', 27017))

    log.info('Create new MongoDB client. Host %s, port %s', host, port)

    mongo_client = pymongo.MongoClient(host, port)

    _mongo_client = mongo_client

    return _mongo_client
