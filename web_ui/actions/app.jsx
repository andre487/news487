import config from '../config';
import * as types from '../constants/ActionTypes';

export function toggleMenu() {
    return { type: types.TOGGLE_MENU };
}

export function selectFilter(selectedFilter, filterTitle) {
    return {
        type: types.SELECT_FILTER,
        selectedFilter,
        filterTitle
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
    return {
        type: types.RECEIVE_CATEGORIES,
        categories
    };
}
