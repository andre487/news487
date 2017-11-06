import * as ActionTypes from '../constants/ActionTypes';
import * as ViewTypes from '../constants/ViewTypes';
import * as util from '../util';

import {LOCATION_CHANGE} from 'react-router-redux';

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
        case LOCATION_CHANGE: {
            const routePath = action.payload.pathname;
            const viewType = util.getViewType(routePath);
            const searchText = util.getSearchText(routePath);
            const page = util.getPage(action.payload.search);

            return {
                ...state,
                routeTitle: getRouteTitle(state, routePath, viewType, searchText),
                routesSynced: true,
                routePath,
                viewType,
                searchText,
                page,
            };
        }

        case ActionTypes.TOGGLE_MENU: {
            return {
                ...state,
                menuOpened: !state.menuOpened
            };
        }

        case ActionTypes.REQUEST_CATEGORIES: {
            return {
                ...state,
                categoriesRequestInProcess: true
            };
        }

        case ActionTypes.RECEIVE_CATEGORIES: {
            return {
                ...state,
                categoriesRequestInProcess: false,
                routesMap: action.routesMap,
                categories: action.categories
            };
        }

        default: {
            return state;
        }
    }
}

function getRouteTitle(state, routePath, viewType, searchText) {
    const routeData = state.routesMap && state.routesMap[routePath];

    if (routeData) {
        return routeData.title;
    }

    if (viewType === ViewTypes.TEXT_SEARCH) {
        return getTextSearchTitle();
    }

    if (viewType === ViewTypes.TAG_SEARCH) {
        return getTagSearchTitle(searchText);
    }

    if (viewType === ViewTypes.CATEGORY) {
        return getCategoryTitle(searchText);
    }

    return 'Unknown';
}

function getTextSearchTitle() {
    return 'Text search';
}

function getTagSearchTitle(searchText) {
    return searchText ? `Tag “${searchText}”` : 'Tag search';
}

function getCategoryTitle(name) {
    return name ? `Cat “${name}”` : 'Digest';
}
