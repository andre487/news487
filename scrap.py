#!/usr/bin/env python
import util


def main():
    scrappers = util.get_scrappers()
    args = util.get_cli_args(scrappers)

    if args.action == 'list':
        util.send_data(args, scrappers['all'])
    elif args.action == 'run':
        util.run_scrappers(args, scrappers)
    else:
        raise RuntimeError('Wrong action: %s' % args.action)


if __name__ == '__main__':
    main()
