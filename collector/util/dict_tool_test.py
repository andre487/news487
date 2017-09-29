from util import dict_tool


def test_get_alternative_base():
    d = {'bar': 'baz'}

    assert dict_tool.get_alternative(d, 'foo', 'bar') == 'baz'


def test_get_alternative_callable():
    d = {'bar': 'baz'}

    assert dict_tool.get_alternative(d, 'foo', lambda v, nf: v.get('bar', nf)) == 'baz'


def test_get_alternative_not_found():
    d = {'bar': 'baz'}

    assert dict_tool.get_alternative(d, 'foo', 'qux') is None


def test_get_alternative_callable_not_found():
    d = {'bar': 'baz'}

    assert dict_tool.get_alternative(d, 'foo', lambda v, nf: v.get('baz', nf)) is None


def test_get_alternative_with_default():
    d = {'bar': 'baz'}

    assert dict_tool.get_alternative(d, 'foo', 'qux', default='baz') == 'baz'


def test_get_alternative_with_assert_val():
    d = {'bar': 'baz'}

    try:
        dict_tool.get_alternative(d, 'foo', 'qux', assert_val=True)
        assert False
    except KeyError:
        pass


def test_get_deep_base():
    d = {
        'foo': {
            'bar': 'baz'
        }
    }

    assert dict_tool.get_deep(d, 'foo', 'bar') == 'baz'


def test_get_deep_with_iterable():
    d = {
        'foo': {
            'baz': ['qux']
        }
    }

    assert dict_tool.get_deep(d, 'foo', 'baz', 0) == 'qux'


def test_get_deep_callable():
    d = {
        'foo': {
            'baz': ['qux']
        }
    }

    assert dict_tool.get_deep(d, 'foo', 'baz', lambda val, nf: val[0]) == 'qux'


def test_get_deep_not_found():
    d = {
        'foo': {
            'baz': ['qux']
        }
    }

    assert dict_tool.get_deep(d, 'foo', 'baz', 1) is None


def test_get_deep_callable_not_found():
    d = {
        'foo': {
            'baz': ['qux']
        }
    }

    assert dict_tool.get_deep(d, 'foo', 'baz', lambda val, nf: nf) is None


def test_get_deep_callable_with_default():
    d = {
        'foo': {'baz': 2}
    }

    assert dict_tool.get_deep(d, 'foo', 'bar', default=3) == 3


def test_get_deep_callable_with_assert_value():
    d = {
        'foo': {'baz': 2}
    }

    try:
        dict_tool.get_deep(d, 'foo', 'bar', assert_val=True)
        assert False
    except KeyError:
        pass
