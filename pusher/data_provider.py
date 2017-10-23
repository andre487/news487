import json
import logging
import pymongo
import os
import requests

FB_API_URL = 'https://fcm.googleapis.com/fcm/send'

fb_server_key = os.environ.get('FIREBASE_SERVER_KEY', os.environ.get('SCRAPPER_487_FIREBASE_SERVER_KEY', '')).strip()
if not fb_server_key:
    raise EnvironmentError('You should provide FIREBASE_SERVER_KEY env var')

_firebase_app = None
_mongo_db = None


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

    db = _get_mongo_db()
    collection = db.get_collection('tokens')

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


def _get_mongo_db():
    global _mongo_db

    if _mongo_db:
        return _mongo_db

    host = os.environ.get('MONGO_HOST', 'localhost')
    port = int(os.environ.get('MONGO_PORT', 27017))

    logging.info('Create new MongoDB client. Host %s, port %s', host, port)

    mongo_client = pymongo.MongoClient(host, port)

    db_name = os.environ.get('MONGO_DB', 'pusher_data')
    _mongo_db = mongo_client[db_name]

    return _mongo_db
