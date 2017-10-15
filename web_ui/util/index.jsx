export function isTextSearchRoute(routePath, routeParams) {
    return routePath.startsWith('/search/') && 'text' in routeParams;
}

export function isTagSearchRoute(routePath, routeParams) {
    return routePath.startsWith('/tag/') && 'tag' in routeParams;
}
