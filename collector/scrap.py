#!/usr/bin/env python
import actions


def main():
    scrappers = actions.get_scrappers()
    args = actions.get_cli_args(scrappers)
    actions.setup(args)

    if args.action == 'list':
        actions.write_data(args, scrappers['all'])
    elif args.action == 'run':
        actions.run_scrappers(args, scrappers)
    else:
        raise RuntimeError('Wrong action: %s' % args.action)


if __name__ == '__main__':
    main()
