# coding=utf-8
import email
import imapclient
import os
import re
import util.date as ud

from email import header as eh


_email_parser = re.compile(r'(?:"?(?P<name>[^<"]+)"?\s+<)?(?P<email>[^>]+)>?')


def parse():
    # @see http://imapclient.readthedocs.io/en/master/

    mail_server = os.environ.get('MAIL_SERVER')
    mail_login = os.environ.get('MAIL_LOGIN')
    mail_password = os.environ.get('MAIL_PASSWORD')
    mark_seen = os.environ.get('MAIL_MARK_SEEN', '1')

    if not mail_server or not mail_login or not mail_password:
        raise Exception('You should provide MAIL_SERVER, MAIL_LOGIN and MAIL_PASSWORD')

    server = imapclient.IMAPClient(mail_server, ssl=True)
    server.login(mail_login, mail_password)

    server.select_folder('INBOX')

    responses = (server.fetch(message_id, ['RFC822']) for message_id in server.search('UNSEEN'))
    data = []
    handled_ids = []

    for res in responses:
        for msg_id, resp_item in res.items():
            message = email.message_from_string(resp_item['RFC822'])

            date = ud.utc_format(message['date'])

            from_name, from_email, full_from = parse_email_field(message['from'])
            to_name, to_email, full_to = parse_email_field(message['to'])

            subj = parse_header(message['subject'])
            content_type, body = parse_message_body(message)

            data.append({
                'title': subj,
                'description': subj,
                'link': 'EmailID(%s,%s)' % (to_email, msg_id),
                'published': date,

                'text': body,
                'text_content_type': content_type,

                'source_name': full_from,
                'source_title': from_name,
                'source_link': 'mailto:' + from_email,
                'source_type': 'email',
                'source_composite': True,

                'author_name': from_name,

                'tags': 'TODO',
            })

            handled_ids.append(msg_id)

    seen_flag = 'Seen' if mark_seen == '1' else 'Unseen'
    server.set_flags(handled_ids, [seen_flag])

    server.logout()

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


if __name__ == '__main__':
    parse()
