import scrapy


class Spider(scrapy.Spider):
    name = 'Yandex news spider'
    start_urls = ['https://news.yandex.ru/']

    def parse(self, response):
        for title in response.css('.story__title'):
            href = title.css('a:first-of-type::attr(href)').extract_first()
            yield response.follow(href, callback=self.parse_story_page)

    def parse_story_page(self, response):
        title = response.css('.story__head::text').extract_first()
        description = ''.join(response.css('.doc_for_story .doc__text::text').extract())

        picture = response.css('.story-media .image::attr(src)').extract_first()

        comment = ''.join(response.css('.citation .citation__content::text').extract())
        author = ''.join(response.css('.citation .citation__author::text').extract())

        yield {
            'title': title,
            'description': description,
            'picture': picture,
            'comments': [{
                'author': author,
                'text': comment,
            }],
        }


if __name__ == '__main__':
    from . import run_spider

    run_spider(Spider)
