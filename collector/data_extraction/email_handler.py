import logging
import re

from multiprocessing.pool import ThreadPool
from data_extraction import doc_handler, link_handler

LINKS_WHITELIST_PATTERNS = (
    re.compile(r'.+developer\.mozilla\.org/[^/]+/.+'),
    re.compile(r'.+letsencrypt\.org/[^/]+/.+'),
    re.compile(r'.+hacks\.mozilla\.org/[^/]+/.+'),
    re.compile(r'.+github\.com/[^/]+/.+'),
    re.compile(r'(?:blog|journal|medium)[./].+'),
)

LINKS_BLACKLIST_TIPS = (
    'MDN_Product_Advisory_Board',
)

log = logging.getLogger('app')


def extract_contained_documents(docs):
    email_docs = filter(lambda doc: doc.get('from_mail') and doc.get('text'), docs)

    all_links = set()
    fake_docs = []

    for doc in email_docs:
        links = set(link_handler.extract_all_links(doc['text']))

        for link in links:
            link_ok = link not in all_links and \
                      any(p.match(link) for p in LINKS_WHITELIST_PATTERNS) and \
                      all(t not in link for t in LINKS_BLACKLIST_TIPS)

            all_links.add(link)

            if link_ok:
                doc_tags = filter(lambda t: t not in {'from_mail', 'composite'}, doc['tags'].split(','))
                doc_tags.append('extracted')
                doc_tags.sort()

                new_tags = ','.join(doc_tags)

                fake_doc = doc.copy()
                fake_doc.update({
                    'link': link,
                    'orig_link': link,
                    'extracted_from': doc['link'],
                    'tags': new_tags,
                    'title': '',
                    'source_type': 'extracted_from_email',
                    'description': '',
                    'text': None,
                    'from_mail': False,
                    'picture': None,
                })

                fake_docs.append(fake_doc)

    pool = ThreadPool()
    dressed_docs = pool.map(doc_handler.dress_document_with_metadata, fake_docs)
    pool.close()

    extracted_docs = filter(lambda doc: doc.get('title') and doc.get('description'), dressed_docs)

    log.info('Extracted %d docs from emails', len(extracted_docs))
    return extracted_docs
