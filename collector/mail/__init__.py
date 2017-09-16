# coding=utf-8
import email
import imapclient
import logging
import os
import re

from email import header as eh
from util import date, tags


log = logging.getLogger('app')

_email_parser = re.compile(r'(?:"?(?P<name>[^<"]+)"?\s+<)?(?P<email>[^>]+)>?')
_tags_parser = re.compile(r'tags:\W*(.+)', re.UNICODE)


def parse():
    # @see http://imapclient.readthedocs.io/en/master/

    mail_server = os.environ.get('MAIL_SERVER')
    mail_login = os.environ.get('MAIL_LOGIN')
    mail_password = os.environ.get('MAIL_PASSWORD')

    readonly = os.environ.get('MAIL_READONLY') == '1'

    if not mail_server or not mail_login or not mail_password:
        raise Exception('You should provide MAIL_SERVER, MAIL_LOGIN and MAIL_PASSWORD')

    server = imapclient.IMAPClient(mail_server, ssl=True)
    server.login(mail_login, mail_password)

    data = []
    for folder_meta, folder_delim, folder_name in server.list_folders():
        if folder_name == 'INBOX' or folder_name.startswith('tags:'):
            data += handle_mailbox_folder(server, folder_name, readonly)

    log.info('Mail: got %d documents', len(data))

    server.logout()
    return data


def handle_mailbox_folder(server, folder_name, readonly=True):
    server.select_folder(folder_name, readonly=readonly)

    responses = (server.fetch(message_id, ['RFC822']) for message_id in server.search('UNSEEN'))
    data = []

    for res in responses:
        for msg_id, resp_item in res.items():
            message = email.message_from_string(resp_item['RFC822'])

            published = date.utc_format(message['date'])

            from_name, from_email, full_from = parse_email_field(message['from'])
            to_name, to_email, full_to = parse_email_field(message['to'])

            subj = parse_header(message['subject'])
            content_type, body = parse_message_body(message)

            tags_list = parse_tags(folder_name)

            data.append({
                'title': subj,
                'description': subj,
                'link': 'EmailID(%s,%s)' % (to_email, msg_id),
                'published': published,

                'text': body,
                'text_content_type': content_type,

                'source_name': 'Mail: ' + full_from,
                'source_title': from_name,
                'source_link': 'mailto:' + from_email,
                'source_type': 'email',
                'source_composite': True,

                'author_name': from_name,

                'tags': tags.string_format(*tags_list),
            })

    return data


def parse_header(val):
    parts = eh.decode_header(val)
    body = '\n'.join(unicode(data, encoding or 'utf-8', errors='ignore') for data, encoding in parts)
    return body


def parse_email_field(from_):
    if from_.startswith('"=?'):
        from_ = from_.replace('"', '')

    name_parts = eh.decode_header(from_)
    body = ' '.join(unicode(data, encoding or 'utf-8', errors='ignore') for data, encoding in name_parts)

    matches = _email_parser.match(body)
    if matches:
        groups = matches.groupdict()
        if 'email' not in groups:
            return body, body, body

        email_addr = groups['email']
        name = groups.get('name', email_addr)

        return name, email_addr, body

    return body, body, body


def parse_message_body(message):
    if message.is_multipart():
        body_instance = message.get_payload()[-1]
        content_type = body_instance.get_content_type()
        body = body_instance.get_payload(decode=True)
    else:
        content_type = message.get_content_type()
        body = message.get_payload(decode=True)

    return content_type, unicode(body, 'utf-8', errors='ignore')


def parse_tags(folder_name):
    matches = _tags_parser.match(folder_name)
    tags_list = ['from_mail', 'composite']

    if matches:
        tags_string = matches.group(1)
        tags_list += [tag.strip() for tag in tags_string.split(',')]

    return tags_list


if __name__ == '__main__':
    parse()
