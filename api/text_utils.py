# coding=utf-8
import flask
import os

scrapper_api_url = os.environ.get('SCRAPPER_API_URL', 'http://localhost:5000')


def get_document_link(doc):
    link = doc.get('link')
    if link is None:
        return None

    if link.startswith('EmailID('):
        link_path = flask.url_for('get_document', id=doc['id'])
        link = scrapper_api_url + link_path

    return link
