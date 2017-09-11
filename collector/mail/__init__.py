import imapclient
import os


def parse():
    # @see http://imapclient.readthedocs.io/en/master/

    mail_server = os.environ.get('MAIL_SERVER')
    mail_login = os.environ.get('MAIL_LOGIN')
    mail_password = os.environ.get('MAIL_PASSWORD')

    if not mail_server or not mail_login or not mail_password:
        raise Exception('You should provide MAIL_SERVER, MAIL_LOGIN and MAIL_PASSWORD')

    client = imapclient.IMAPClient(mail_server, ssl=True)
    client.login(mail_login, mail_password)

    client.select_folder('INBOX', readonly=True)

    responses = (
        client.fetch(message_id, ['INTERNALDATE', 'ENVELOPE'])
        for message_id in client.search('UNSEEN')
    )

    for res in responses:
        for msg_id, data in res.items():
            print msg_id, data['ENVELOPE'].date, data['ENVELOPE'].subject


if __name__ == '__main__':
    parse()
