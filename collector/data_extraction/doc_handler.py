# coding=utf-8
import logging
import link_handler
import random
import re
import requests
import time
import urlparse

from collections import defaultdict
from HTMLParser import HTMLParser
from params import REQUEST_HEADERS
from util import db

log = logging.getLogger('app')

words_splitter = re.compile(r'\s+', re.UNICODE)
non_word_stripper = re.compile(r'(\w)\W+$', re.UNICODE)
full_url_pattern = re.compile(r'^(?:https?:)?//')


class MeaningParser(HTMLParser):
    block_tags = {'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'}

    def __init__(self):
        HTMLParser.__init__(self)

        self.reset()

        self._meta_data = {}
        self._content_data = defaultdict(list)

        self._current_content = ''

        self._cur_level = 0
        self._gathering_level = None

    def handle_starttag(self, tag, attrs):
        if tag == 'meta':
            self._handle_meta(attrs)
        elif tag == 'img':
            self._handle_img(attrs)
        else:
            self._cur_level += 1
            if tag in self.block_tags and self._gathering_level is None:
                self._gathering_level = self._cur_level

    def handle_endtag(self, tag):
        if tag in self.block_tags and self._cur_level == self._gathering_level:
            content = strip_tags(self._current_content)
            self._current_content = ''

            self._content_data[tag].append({'content': content})
            self._gathering_level = None

        self._cur_level -= 1

    def handle_data(self, data):
        if self._gathering_level:
            self._current_content += data

    def get_meta_data(self):
        return self._meta_data

    def get_content_data(self):
        return self._content_data

    def _handle_meta(self, attrs):
        d_attrs = dict(attrs)
        name = d_attrs.get('name', d_attrs.get('property'))
        content = d_attrs.get('content')

        if name and content:
            self._meta_data[name] = content

    def _handle_img(self, attrs):
        d_attrs = dict(attrs)
        src = d_attrs.get('src')
        if src:
            self._content_data['img'].append({
                'src': src,
                'width': d_attrs.get('width'),
                'height': d_attrs.get('height'),
                'alt': d_attrs.get('alt', '')
            })


class MeaningExtractor(object):
    def __init__(self, html, base_url=None):
        if base_url and base_url.endswith('/'):
            base_url = base_url[:-1]
        self._base_url = base_url

        parser = MeaningParser()
        parser.feed(html)

        self._meta_data = parser.get_meta_data()
        self._content_data = parser.get_content_data()

    def get_meta_data(self):
        return self._meta_data

    def get_content_data(self):
        return self._content_data

    def get_card_type(self):
        return self._get_meta_card_type()

    def get_link(self):
        return self._get_meta_link()

    def get_title(self):
        if 'title' in self._content_data and self._content_data['title']:
            return self._content_data['title'][0]['content']

        return self._get_meta_title() or self.get_header()

    def get_header(self):
        for i in range(1, 7):
            header_name = 'h' + str(i)
            if header_name in self._content_data:
                return self._content_data[header_name][0]['content']

    def get_description(self):
        return self._get_meta_description()

    def guess_description(self):
        description = self.get_description()
        if description:
            return description

        if 'p' in self._content_data:
            return self._content_data['p'][0]['content']

        if 'title' in self._content_data:
            return self._content_data['title'][0]['content']

        return self.get_header()

    def guess_short_description(self, length=140):
        description = self._get_meta_description() or self.guess_description()
        if not description:
            return None

        parts = words_splitter.split(description)

        sd = ''
        sd_len = 0
        for i in range(0, len(parts)):
            cur_part = parts[i]
            cur_len = len(cur_part)

            if sd_len + cur_len + 1 > length:
                short_cur_part = non_word_stripper.sub(r'\1', cur_part)

                if sd_len + len(short_cur_part) + 1 <= length:
                    sd += ' ' + short_cur_part

                sd += u'…'
                break

            sd += ' ' + cur_part
            sd_len += cur_len

        return sd.strip()

    def get_picture(self):
        meta_picture = self._get_meta_picture()
        if meta_picture:
            return meta_picture

        if 'img' not in self._content_data:
            return None

        alt_images = []
        no_alt_images = []

        for attrs in self._content_data['img']:
            if attrs['width'] and attrs['height'] and attrs['width'] != '100%' and attrs['height'] != '100%':
                try:
                    width = int(attrs['width'].replace('px', ''))
                    height = int(attrs['height'].replace('px', ''))
                    if width < 50 and height < 50:
                        continue
                except Exception as e:
                    log.debug(e.message)

            if attrs['alt']:
                alt_images.append(attrs['src'])
            else:
                no_alt_images.append(attrs['src'])

        pic = None
        if alt_images:
            pic = alt_images[0]
        elif no_alt_images:
            pic = no_alt_images[0]

        if pic and not full_url_pattern.match(pic) and self._base_url:
            if not pic.startswith('/'):
                pic = '/' + pic
            pic = self._base_url + pic

        return pic

    def _get_meta_card_type(self):
        return self._get_meta_general('og:type', 'twitter:card')

    def _get_meta_link(self):
        return self._get_meta_general('og:url')

    def _get_meta_title(self):
        return self._get_meta_general('og:title', 'twitter:title', 'title')

    def _get_meta_description(self):
        return self._get_meta_general('og:description', 'twitter:description', 'description')

    def _get_meta_picture(self):
        return self._get_meta_general('og:image', 'twitter:image')

    def _get_meta_general(self, *names):
        for name in names:
            if name in self._meta_data:
                return self._meta_data[name].strip()


class TagsStripper(HTMLParser):
    remove_content_of = {'style', 'script', 'template'}
    spaces_finder = re.compile(r'\s+')
    spaces_remover = re.compile(r'^\s+|\s$')

    simple_typo = re.compile(r'(\w)\s+(%s)' % '|'.join((',', '\.', '!', '\?', ':', ';')), re.UNICODE)

    def __init__(self):
        HTMLParser.__init__(self)

        self.reset()
        self._content_parts = []
        self._skip_next = False

    def handle_starttag(self, tag, attrs):
        self._skip_next = tag in self.remove_content_of

    def handle_endtag(self, tag):
        self._skip_next = False

    def handle_data(self, data):
        if not self._skip_next:
            self._content_parts.append(data.strip())

    def get_data(self):
        content = ' '.join(self._content_parts)

        content = self.spaces_finder.sub(' ', content)
        content = self.spaces_remover.sub('', content)

        content = self.simple_typo.sub(r'\1\2', content)

        return content


def dress_document_with_metadata(doc):
    if doc.get('dressed'):
        return doc

    try:
        if doc.get('from_mail'):
            return dress_email_document(doc)

        return dress_page_document(doc)
    except Exception as e:
        log.warn(e)
        return doc


def dress_email_document(doc):
    extr = MeaningExtractor(doc['text'])

    doc['orig_description'] = doc['description']
    doc['description'] = extr.get_description() or doc['description']

    doc['picture'] = extr.get_picture()
    doc['dressed'] = True

    return doc


def dress_page_document(doc):
    url = doc['link']

    timeout = random.randint(1000, 2500) / 1000.0
    time.sleep(timeout)

    result = requests.get(url, headers=REQUEST_HEADERS)

    if result.status_code != 200:
        log.warn('Code %s from url %s', result.status_code, url)
        return doc

    if not result.headers.get('Content-Type', '').startswith('text/'):
        log.info('Document is not a text: %s', url)
        return doc

    if result.encoding == 'ISO-8859-1':
        result.encoding = 'UTF-8'

    url_data = urlparse.urlparse(url)
    base_url = '{}://{}'.format(url_data.scheme, url_data.netloc)
    extr = MeaningExtractor(result.text, base_url=base_url)

    doc['link'] = link_handler.clean_url(result.url)
    doc['card_type'] = extr.get_card_type()

    doc['orig_title'] = doc['title']
    doc['title'] = extr.get_title() or doc['title']

    doc['orig_picture'] = doc.get('picture')
    doc['picture'] = extr.get_picture() or doc['orig_picture']

    doc['orig_description'] = doc['description']
    doc['description'] = extr.get_description() or doc['description']
    doc['short_description'] = extr.guess_short_description()

    doc['dressed'] = True

    return doc


def strip_tags(html):
    parser = TagsStripper()
    parser.feed(html)
    return parser.get_data()


def filter_new_docs(docs):
    collection = db.get_collection()
    if not collection:
        return docs

    cursor = collection.find({
        'dressed': True,
        '$or': [
            {'from_mail': {'$exists': False}},
            {'from_mail': False},
        ]
    })

    dressed_links = {doc['link'] for doc in cursor}
    new_documents = [doc for doc in docs if doc['link'] not in dressed_links]

    log.info(
        'Have %d dressed documents, %d new documents',
        len(dressed_links), len(new_documents),
    )

    return new_documents
