def string_format(*tags):
    return ','.join([tag.lower() for tag in sorted(tags)])
