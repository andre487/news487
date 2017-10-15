import * as ActionTypes from '../constants/ActionTypes';
import * as ViewTypes from '../constants/ViewTypes';
import * as util from '../util';

const initialState = {
    menuOpened: null,
    categoriesRequestInProcess: null,
    viewType: ViewTypes.CATEGORY,
    routePath: '/digest',
    routeTitle: 'Digest',
    categories: [],
    routesMap: {
        '/digest': {
            name: 'digest',
            pathName: '/digest',
            title: 'Digest'
        },
        '/search': {
            name: 'textSearch',
            pathName: '/search',
            title: 'Text search'
        }
    },
    routesSynced: false,
    searchText: null
};

export default function app(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.SYNC_ROUTES:
            const { routePath, routeParams } = action;
            const isSearch = util.isTextSearchRoute(routePath, routeParams);

            const searchText = isSearch ? routeParams.text : null;
            const viewType = isSearch ? ViewTypes.TEXT_SEARCH : ViewTypes.CATEGORY;

            return {
                ...state,
                routeTitle: getRouteTitle(state, routePath, routeParams),
                routePath: action.routePath,
                routeParams: action.routeParams,
                routesSynced: true,
                viewType,
                searchText
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
                routeTitle: getRouteTitle(state, action.routePath, action.routeParams),
                routePath: action.routePath,
                viewType: ViewTypes.CATEGORY
            };

        case ActionTypes.TEXT_SEARCH:
            return {
                ...state,
                searchText: action.text,
                viewType: ViewTypes.TEXT_SEARCH
            };

        default:
            return state;
    }
};

function getRouteTitle(state, routePath, routeParams) {
    const routeData = state.routesMap[routePath];

    if (routeData) {
        return routeData.title;
    }

    const isSearch = util.isTextSearchRoute(routePath, routeParams);
    if (isSearch) {
        return 'Text search';
    }

    const catMatches = /\/category\/([^\/]+)/.exec(routePath);
    if (catMatches) {
        return `Category “${catMatches[1]}”`;
    }

    return 'Unknown';
}
