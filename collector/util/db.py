import logging
import mongo_db
import proj_constants as const

log = logging.getLogger('app')


def get_collection():
    client = mongo_db.get_client()

    if not client:
        return

    return client[const.NEWS_DB][const.NEWS_COLLECTION]


close = mongo_db.close
