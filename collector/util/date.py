import dateutil.parser
import pytz


def parse(str_date):
    return dateutil.parser.parse(str_date).astimezone(pytz.utc)
