import json
import logging
import pymongo
import pymongo.errors

log = logging.getLogger('app')


def write_data(args, data):
    if args.mongo:
        write_to_mongo(args, data)
    else:
        need_ascii = not args.unicode_json
        print json.dumps(data, ensure_ascii=need_ascii, indent=2)


def write_to_mongo(args, data):
    log.info('Write to MongoDB')

    host = args.mongo['host'] or 'localhost'
    port = args.mongo['port'] or 27017

    log.info('Connect to MongoDB: %s:%s', host, port)

    db = pymongo.MongoClient(host, port)[args.mongo_db]
    collection = db['items']

    collection.create_index([
        ('link', pymongo.ASCENDING),
        ('title', pymongo.ASCENDING),
        ('source_name', pymongo.ASCENDING),
        ('source_type', pymongo.ASCENDING),
    ], unique=True, expireAfterSeconds=15552000)

    collection.create_index([
        ('published', pymongo.DESCENDING),
    ])

    collection.create_index([
        ('tags', pymongo.ASCENDING),
    ])

    collection.create_index([
        ('tags', pymongo.TEXT),
        ('title', pymongo.TEXT),
        ('description', pymongo.TEXT),
        ('text', pymongo.TEXT),
        ('author_name', pymongo.TEXT),
    ], default_language='russian')

    inserted_documents = 0
    updated_documents = 0

    for item in data:
        spec = {
            'link': item['link'],
            'title': item['title'],
            'source_name': item['source_name'],
            'source_type': item['source_type'],
        }
        status = collection.update(spec, item, upsert=True)

        if status['updatedExisting']:
            updated_documents += 1
        else:
            inserted_documents += 1

    pymongo.MongoClient(host, port).close()

    log.info('Documents have inserted: %d', inserted_documents)
    log.info('Documents have updated: %d', updated_documents)
    log.info('Connection to MongoDB closed')
