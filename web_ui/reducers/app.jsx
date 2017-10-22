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
        },
        '/tag': {
            name: 'tagSearch',
            pathName: '/tag',
            title: 'Tag search'
        }
    },
    routesSynced: false,
    searchText: null
};

export default function app(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.SYNC_ROUTES:
            const { routePath, routeParams } = action;

            const isTextSearch = util.isTextSearchRoute(routePath, routeParams);
            const isTagSearch = util.isTagSearchRoute(routePath, routeParams);

            const searchText = isTextSearch || isTagSearch ? routeParams.text : null;

            let viewType = ViewTypes.CATEGORY;
            if (isTextSearch) {
                viewType = ViewTypes.TEXT_SEARCH;
            } else if (isTagSearch) {
                viewType = ViewTypes.TAG_SEARCH;
            }

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
                routeTitle: getTextSearchTitle(),
                routePath: action.routePath,
                searchText: action.text,
                viewType: ViewTypes.TEXT_SEARCH
            };

        case ActionTypes.TAG_SEARCH:
            return {
                ...state,
                routeTitle: getTagSearchTitle(action.text),
                routePath: action.routePath,
                searchText: action.text,
                viewType: ViewTypes.TAG_SEARCH
            };

        default:
            return state;
    }
}

function getRouteTitle(state, routePath, routeParams) {
    const routeData = state.routesMap[routePath];

    if (routeData) {
        return routeData.title;
    }

    if (util.isTextSearchRoute(routePath, routeParams)) {
        return getTextSearchTitle();
    }

    if (util.isTagSearchRoute(routePath, routeParams)) {
        return getTagSearchTitle(routeParams.tag);
    }

    const catMatches = /\/category\/([^/]+)/.exec(routePath);
    if (catMatches) {
        return getCategoryTitle(catMatches[1]);
    }

    return 'Unknown';
}

function getTextSearchTitle() {
    return 'Text search';
}

function getTagSearchTitle(tag) {
    return `Tag “${tag}”`;
}

function getCategoryTitle(name) {
    return `Cat “${name}”`;
}
