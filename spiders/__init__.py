import importlib
import logging
import scrapy.signals

from scrapy.crawler import CrawlerProcess


class CrawlerProcessWithData(CrawlerProcess):
    def __init__(self, *args, **kwargs):
        super(CrawlerProcessWithData, self).__init__(*args, **kwargs)

        self._data = []

    def crawl(self, crawler_or_spidercls, *args, **kwargs):
        self._data = []

        crawler = self.create_crawler(crawler_or_spidercls)
        crawler.signals.connect(self._item_scrapped, scrapy.signals.item_scraped)

        return self._crawl(crawler, *args, **kwargs)

    def _item_scrapped(self, item, *args, **kwargs):
        self._data.append(item)

    @property
    def data(self):
        return self._data


def run_spider(spider_class):
    process = CrawlerProcessWithData({
        'USER_AGENT': (
            'Mozilla/5.0 '
            '(Macintosh; Intel Mac OS X 10_12_6) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/59.0.3071.125 YaBrowser/17.7.1.720 Yowser/2.5 Safari/537.36'
        ),
        'LOG_LEVEL': logging.WARN
    })
    process.crawl(spider_class())
    process.start()

    return process.data


def run_spider_by_name(name):
    spider_module = importlib.import_module('spiders.' + name)
    return run_spider(spider_module.Spider)
