import importlib


def parse_feed_by_name(name):
    feed_module = importlib.import_module('rss.' + name)
    return feed_module.parse()
