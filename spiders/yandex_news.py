import re
import scrapy

from datetime import datetime


class Spider(scrapy.Spider):
    name = 'Yandex news spider'
    start_urls = ['https://news.yandex.ru/']

    time_pattern = re.compile(r'(\d+):(\d+)')

    def parse(self, response):
        for title in response.css('.story__title'):
            href = title.css('a:first-of-type::attr(href)').extract_first()
            yield response.follow(href, callback=self.parse_story_page)

    def parse_story_page(self, response):
        title = response.css('.story__head::text').extract_first()
        description = ''.join(response.css('.doc_for_story .doc__text::text').extract())

        picture = response.css('.story-media .image::attr(src)').extract_first()

        published = response.css('.doc_for_story .doc__time::text').extract_first()

        comment = ''.join(response.css('.citation .citation__content::text').extract())
        author = ''.join(response.css('.citation .citation__author::text').extract())

        yield {
            'title': title,
            'description': description,
            'picture': picture,
            'published': self.get_date(published),
            'source_name': 'Yandex News',
            'source_link': self.start_urls[0],
            'comments': [{
                'author': author,
                'text': comment,
            }],
        }

    @classmethod
    def get_date(cls, published):
        data = cls.time_pattern.match(published)
        hour = 0
        minute = 0

        if data:
            try:
                hour = int(data.group(1))
                minute = int(data.group(2))
            except ValueError:
                hour = 0
                minute = 0

        now = datetime.now()
        date = datetime(year=now.year, month=now.month, day=now.day, hour=hour, minute=minute)

        return date.strftime('%Y-%m-%dT%H:%M:00')

if __name__ == '__main__':
    from . import run_spider

    run_spider(Spider)
