import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
    menuOpened: null,
    categoriesRequestInProcess: null,
    routePath: '/digest',
    routeTitle: 'Digest',
    categories: [],
    routesMap: {
        '/digest': {
            name: 'digest',
            pathName: '/digest',
            title: 'Digest'
        }
    },
    routesSynced: false
};

export default function app(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.SYNC_ROUTES:
            return {
                ...state,
                routeTitle: getRouteTitle(state, action.routePath),
                routePath: action.routePath,
                routesSynced: true
            };

        case ActionTypes.TOGGLE_MENU:
            return {
                ...state,
                menuOpened: !state.menuOpened
            };

        case ActionTypes.REQUEST_CATEGORIES:
            return {
                ...state,
                categoriesRequestInProcess: true
            };

        case ActionTypes.RECEIVE_CATEGORIES:
            return {
                ...state,
                categoriesRequestInProcess: false,
                routesMap: action.routesMap,
                categories: action.categories
            };

        case ActionTypes.SELECT_FILTER:
            return {
                ...state,
                routeTitle: getRouteTitle(state, action.routePath),
                routePath: action.routePath
            };

        default:
            return state;
    }
};

function getRouteTitle(state, routePath) {
    const routeParams = state.routesMap[routePath];

    if (routeParams) {
        return routeParams.title;
    }

    const catMatches = /\/category\/([^\/]+)/.exec(routePath);
    if (catMatches) {
        return `Category “${catMatches[1]}”`;
    }

    return 'Unknown';
}
