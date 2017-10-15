import {push, replace} from 'react-router-redux/actions';

import config from '../config';
import * as ActionTypes from '../constants/ActionTypes';

export function toggleMenu() {
    return { type: ActionTypes.TOGGLE_MENU };
}

export function pushRoute(routePath, routeParams) {
    return push(routePath, routeParams);
}

export function replaceRoute(routePath, routeParams) {
    return replace(routePath, routeParams);
}

export function selectFilter(routePath) {
    return dispatch => {
        dispatch({
            type: ActionTypes.SELECT_FILTER,
            routePath
        });
        dispatch(pushRoute(routePath));
    };
}

export function fetchCategories() {
    return (dispatch, getState) => {
        const state = getState();

        if (state.categoriesRequestInProcess || state.categories && state.categories.length) {
            return;
        }

        dispatch(requestCategories());
        return fetch(`${config.apiUrl}/get-categories`)
            .then(response => response.json())
            .then(categories => dispatch(receiveCategories(categories)));
    };

}

export function requestCategories() {
    return { type: ActionTypes.REQUEST_CATEGORIES };
}

export function receiveCategories(categories) {
    let routesMap = {
        '/digest': {
            name: 'digest',
            pathName: '/digest',
            title: 'Digest'
        }
    };

    for (let category of categories) {
        category.pathName = `/category/${category.name}`;
        category.title = `Category "${category.name}"`;

        routesMap[category.pathName] = category;
    }

    routesMap = {
        ...routesMap,
        '/tag': {
            name: 'tagSearch',
            pathName: '/tag',
            title: 'Tag search'
        },
        '/search': {
            name: 'textSearch',
            pathName: '/search',
            title: 'Text search'
        }
    };

    return {
        type: ActionTypes.RECEIVE_CATEGORIES,
        routesMap,
        categories
    };
}

export function syncRoutes(routePath, routeParams) {
    return {
        type: ActionTypes.SYNC_ROUTES,
        routePath,
        routeParams
    };
}

export function searchByText(text) {
    return dispatch => {
        const cleanText = text.trim();

        if (!cleanText) {
            throw new Error('Empty text');
        }

        dispatch(pushRoute(`/search/${encodeURIComponent(cleanText)}`));

        dispatch({
            type: ActionTypes.TEXT_SEARCH,
            text: cleanText
        });
    };
}

export function searchByTag(tag) {
    return dispatch => {
        const cleanTag = tag.trim();

        if (!cleanTag) {
            throw new Error('Empty tag');
        }

        dispatch(pushRoute(`/tag/${encodeURIComponent(cleanTag)}`));

        dispatch({
            type: ActionTypes.TAG_SEARCH,
            text: cleanTag
        });
    };
}
