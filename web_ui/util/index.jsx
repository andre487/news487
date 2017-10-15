export function isTextSearchRoute(routePath, routeParams) {
    return routePath.startsWith('/search/') && 'text' in routeParams;
}
