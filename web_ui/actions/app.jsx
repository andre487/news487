import {push} from 'react-router-redux/actions';

import config from '../config';
import * as ActionTypes from '../constants/ActionTypes';

export function toggleMenu() {
    return { type: ActionTypes.TOGGLE_MENU };
}

export function pushRoute(routePath) {
    return push(routePath);
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
            title: 'Digest',
            label: 'Digest'
        }
    };

    for (let category of categories) {
        category.pathName = `/category/${category.name}`;
        category.title = `Cat "${category.name}"`;
        category.label = `Category "${category.name}"`;

        routesMap[category.pathName] = category;
    }

    routesMap = {
        ...routesMap,
        '/tag': {
            name: 'tagSearch',
            pathName: '/tag',
            title: 'Tag search',
            label: 'Tag search',
        },
        '/search': {
            name: 'textSearch',
            pathName: '/search',
            title: 'Text search',
            label: 'Text search',
        }
    };

    return {
        type: ActionTypes.RECEIVE_CATEGORIES,
        routesMap,
        categories
    };
}

export function searchByText(text) {
    return dispatch => {
        const cleanText = text.trim();

        if (!cleanText) {
            throw new Error('Empty text');
        }

        const routePath = `/search/${encodeURIComponent(cleanText)}`;

        dispatch(pushRoute(routePath));
        dispatch({
            type: ActionTypes.TEXT_SEARCH,
            text: cleanText,
            routePath
        });
    };
}

export function searchByTag(tag) {
    return dispatch => {
        const cleanTag = tag.trim();

        if (!cleanTag) {
            throw new Error('Empty tag');
        }

        const routePath = `/tag/${encodeURIComponent(cleanTag)}`;

        dispatch(pushRoute(routePath));
        dispatch({
            type: ActionTypes.TAG_SEARCH,
            text: cleanTag,
            routePath
        });
    };
}
