import dateutil.parser
import pytz


def utc_format(str_date):
    return dateutil.parser.parse(str_date) \
        .astimezone(pytz.utc) \
        .strftime('%Y-%m-%dT%H:%M:00')
