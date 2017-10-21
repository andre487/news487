#!/usr/bin/env python
import dateutil.parser
import json
import pymongo
import os

from bson.objectid import ObjectId
from datetime import datetime


def main():
    fp = open(os.path.join(os.path.dirname(__file__), 'fixture.json'))
    fixture = json.load(fp)

    mongo_port = os.environ.get('MONGO_PORT')
    if mongo_port is None:
        raise Exception('You should provide MONGO_PORT')

    client = pymongo.MongoClient(port=int(mongo_port))
    client.drop_database('news_documents')

    collection = client.get_database('news_documents').get_collection('items')

    for item in fixture:
        item['published'] = dateutil.parser.parse(item['published'])

    collection.insert_many(fixture)

    collection.insert_one({
        '_id': ObjectId('59bd4b1ee08a7fde9eb15d51'),

        'title': 'Test title',
        'description': 'Test description',
        'link': 'http://natribu.org',
        'published': datetime(year=1970, month=1, day=1),

        'source_name': 'TestSource',
        'source_type': 'test',
        'source_title': 'Test source',
        'source_link': 'http://natribu.org',

        'author_name': 'tester',
        'author_link': 'http://natribu.org',

        'tags': 'test',
    })

    print 'Fixture loaded'


if __name__ == '__main__':
    main()
