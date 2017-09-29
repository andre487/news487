NOT_FOUND = {}


def get_alternative(d, *alternatives, **kwargs):
    val = NOT_FOUND

    for key in alternatives:
        if callable(key):
            val = key(d, NOT_FOUND)
        else:
            try:
                val = d[key]
            except KeyError:
                val = NOT_FOUND

        if val is not NOT_FOUND:
            return val

    if val is NOT_FOUND:
        if kwargs.get('assert_val'):
            raise KeyError('None from %s found in dict' % ','.join(alternatives))

        return kwargs.get('default')


def get_deep(d, *path, **kwargs):
    val = d
    for key in path:
        if callable(key):
            val = key(val, NOT_FOUND)
        else:
            try:
                val = val[key]
            except (KeyError, IndexError):
                val = NOT_FOUND

        if val is NOT_FOUND:
            if kwargs.get('assert_val'):
                raise KeyError('Val from path %s not found in dict' % ','.join(path))
            break

    if val is NOT_FOUND:
        return kwargs.get('default')

    return val
