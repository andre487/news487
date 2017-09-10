#!/usr/bin/env python
import dateutil.parser
import json
import pymongo
import os


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

    collection.create_index([
        ('title', pymongo.TEXT),
    ])

    collection.insert_many(fixture)

    print 'Fixture loaded'


if __name__ == '__main__':
    main()
