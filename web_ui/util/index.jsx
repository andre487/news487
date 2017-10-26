import * as ViewTypes from '../constants/ViewTypes';

export function isTextSearchRoute(routePath) {
    return routePath.startsWith('/search/');
}

export function isTagSearchRoute(routePath) {
    return routePath.startsWith('/tag/');
}

export function getViewType(routePath) {
    const isTextSearch = isTextSearchRoute(routePath);
    const isTagSearch = isTagSearchRoute(routePath);

    let viewType = ViewTypes.CATEGORY;
    if (isTextSearch) {
        viewType = ViewTypes.TEXT_SEARCH;
    } else if (isTagSearch) {
        viewType = ViewTypes.TAG_SEARCH;
    }

    return viewType;
}

export function getSearchText(routePath) {
    const matches = /\/[^/]+\/(.+)/.exec(routePath);
    if (matches) {
        return decodeURIComponent(matches[1]);
    }
    return '';
}

export function removeMarkup(text) {
    return text.replace(/<\/?[^>]+?>/ig, '')
        .replace(/&nbsp;/gi, ' ');
}
