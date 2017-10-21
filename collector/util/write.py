import dateutil.parser
import json
import logging
import pymongo
import pymongo.errors

from util import db

log = logging.getLogger('app')


def write_data(args, data):
    res = write_to_mongo(data)
    if not res:
        need_ascii = not args.unicode_json
        print json.dumps(data, ensure_ascii=need_ascii, indent=2)


def write_to_mongo(data):
    collection = db.get_collection()
    if not collection:
        return False

    log.info('Writing to MongoDB')

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
        ('dressed', pymongo.ASCENDING),
        ('from_mail', pymongo.ASCENDING),
        ('published', pymongo.DESCENDING),
    ], sparse=True)

    collection.create_index([
        ('tags', pymongo.ASCENDING),
    ])

    inserted_documents = 0
    updated_documents = 0

    for item in data:
        spec = {
            'link': item['link'],
            'title': item['title'],
            'source_name': item['source_name'],
            'source_type': item['source_type'],
        }

        item['published'] = dateutil.parser.parse(item['published'])

        status = collection.update(spec, item, upsert=True)

        if status['updatedExisting']:
            updated_documents += 1
        else:
            inserted_documents += 1

    db.close()

    log.info('Documents have inserted: %d', inserted_documents)
    log.info('Documents have updated: %d', updated_documents)

    return True
