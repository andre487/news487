# coding=utf-8
import re

from collections import defaultdict
from HTMLParser import HTMLParser


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


class MeaningExtractor(HTMLParser):
    block_tags = {'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'}

    words_splitter = re.compile(r'\s+', re.UNICODE)
    non_word_stripper = re.compile(r'(\w)\W+$', re.UNICODE)

    def __init__(self):
        HTMLParser.__init__(self)

        self.reset()

        self._data = defaultdict(list)
        self._current_content = ''

        self._cur_level = 0
        self._gathering_level = None

    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            self._handle_img(attrs)
        else:
            self._cur_level += 1
            if tag in self.block_tags and self._gathering_level is None:
                self._gathering_level = self._cur_level

    def handle_endtag(self, tag):
        if tag in self.block_tags and self._cur_level == self._gathering_level:
            content = strip_tags(self._current_content)
            self._current_content = ''

            self._data[tag].append({'content': content})
            self._gathering_level = None

        self._cur_level -= 1

    def handle_data(self, data):
        if self._gathering_level:
            self._current_content += data

    def get_data(self):
        return self._data

    def get_title(self):
        if 'title' in self._data:
            return self._data['title'][0]['content']

        return self.get_header()

    def get_header(self):
        for i in range(1, 7):
            header_name = 'h' + str(i)
            if header_name in self._data:
                return self._data[header_name][0]['content']

    def get_description(self):
        if 'p' in self._data:
            return self._data['p'][0]['content']

        if 'title' in self._data:
            return self._data['title'][0]['content']

        return self.get_header()

    def get_short_description(self, length=140):
        description = self.get_description()
        if not description:
            return None

        parts = self.words_splitter.split(description)

        sd = ''
        sd_len = 0
        for i in range(0, len(parts)):
            cur_part = parts[i]
            cur_len = len(cur_part)

            if sd_len + cur_len + 1 > length:
                short_cur_part = self.non_word_stripper.sub(r'\1', cur_part)

                if sd_len + len(short_cur_part) + 1 <= length:
                    sd += ' ' + short_cur_part

                sd += u'…'
                break

            sd += ' ' + cur_part
            sd_len += cur_len

        return sd.strip()

    def get_picture(self):
        if 'img' not in self._data:
            return None

        return self._data['img'][0]['src']

    def _handle_img(self, attrs):
        d_attrs = dict(attrs)
        src = d_attrs.get('src')
        if src:
            self._data['img'].append({
                'src': src,
                'alt': d_attrs.get('alt', ''),
            })


def strip_tags(html):
    parser = TagsStripper()
    parser.feed(html)
    return parser.get_data()


def get_metadata(content):
    parser = MeaningExtractor()
    parser.feed(content)

    return {
        'description': parser.get_short_description(),
        'picture': parser.get_picture(),
    }
