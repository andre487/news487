import json
import logging
import pymongo
import pymongo.errors

log = logging.getLogger('app')


def write_data(args, data):
    if args.mongo:
        write_to_mongo(args, data)
    else:
        print json.dumps(data, indent=2)


def write_to_mongo(args, data):
    log.info('Write to MongoDB')

    host = args.mongo['host'] or 'localhost'
    port = args.mongo['port'] or 27017

    log.info('Connect to MongoDB: %s:%s', host, port)

    if args.mongo_user or args.mongo_password:
        client = pymongo.MongoClient(
            host, port,
            username=args.mongo_user,
            password=args.mongo_password,
        )
    else:
        client = pymongo.MongoClient(host, port)

    db = client[args.mongo_db]
    collection = db['items']

    collection.create_index([
        ('published', pymongo.DESCENDING),
        ('title', pymongo.ASCENDING),
        ('link', pymongo.ASCENDING),
        ('source_name', pymongo.ASCENDING),
    ], unique=True, expireAfterSeconds=31536000)

    collection.create_index([
        ('tags', pymongo.TEXT),
        ('title', pymongo.TEXT),
        ('description', pymongo.TEXT),
    ], default_language='russian')

    writen_documents = 0

    for item in data:
        try:
            collection.insert(item)
            writen_documents += 1
        except pymongo.errors.DuplicateKeyError as e:
            log.debug(unicode(e).encode('ascii', errors='ignore'))

    client.close()

    log.info('Documents have written: %d', writen_documents)
    log.info('Connection to MongoDB closed')
