def create_tags_list(*tags):
    tags_list = list(set(tags))
    tags_list.sort()
    return tags_list
