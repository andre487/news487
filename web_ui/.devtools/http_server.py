import logging
import re
import SocketServer
import sys

from SimpleHTTPServer import SimpleHTTPRequestHandler


class HttpHandler(SimpleHTTPRequestHandler):
    _resource_pattern = re.compile(r'.*/[^/]+?\.\w+$')

    def send_error(self, code, message=None):
        is_resource = self._resource_pattern.match(self.path)

        if code == 404 and not is_resource:
            logging.info('Reroute handler %s', self.path)
            self.path = '/'
            self.do_GET()
        else:
            SimpleHTTPRequestHandler.send_error(self, code, message)


def main():
    if len(sys.argv) < 2:
        raise Exception('Usage http_server.py PORT')

    port = int(sys.argv[1])

    httpd = SocketServer.TCPServer(('localhost', port), HttpHandler)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
