import SimpleHTTPServer
import SocketServer
import sys


def main():
    if len(sys.argv) < 2:
        raise Exception('Usage http_server.py PORT')

    port = int(sys.argv[1])

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(('localhost', port), Handler)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
