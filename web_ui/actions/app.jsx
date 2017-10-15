import {replace} from 'react-router-redux/actions';

import config from '../config';
import * as types from '../constants/ActionTypes';

export function toggleMenu() {
    return { type: types.TOGGLE_MENU };
}

export function selectFilter(routePath) {
    return dispatch => {
        dispatch({
            type: types.SELECT_FILTER,
            routePath
        });
        dispatch(replace(routePath));
    };
}

export function fetchCategories() {
    return (dispatch, getState) => {
        const state = getState();

        if (state.categoriesRequestInProcess || state.categories && state.categories.length) {
            return;
        }

        dispatch(requestCategories);
        return fetch(`${config.apiUrl}/get-categories`)
            .then(response => response.json())
            .then(categories => dispatch(receiveCategories(categories)));
    };

}

export function requestCategories() {
    return { type: types.REQUEST_CATEGORIES };
}

export function receiveCategories(categories) {
    const routesMap = {
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

    return {
        type: types.RECEIVE_CATEGORIES,
        routesMap,
        categories
    };
}

export function syncRoutes(routePath, routeName) {
    return {
        type: types.SYNC_ROUTES,
        routePath,
        routeName
    };
}
