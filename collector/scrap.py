#!/usr/bin/env python
from util import common as util


def main():
    scrappers = util.get_scrappers()
    args = util.get_cli_args(scrappers)
    util.setup(args)

    if args.action == 'list':
        util.write_data(args, scrappers['all'])
    elif args.action == 'run':
        util.run_scrappers(args, scrappers)
    else:
        raise RuntimeError('Wrong action: %s' % args.action)


if __name__ == '__main__':
    main()
