import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
    menuOpened: null,
    categoriesRequestInProcess: null,
    categories: null,
    selectedFilter: 'digest'
};

export default function app(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.TOGGLE_MENU:
            return Object.assign({}, state, { menuOpened: !state.menuOpened });

        case ActionTypes.REQUEST_CATEGORIES:
            return Object.assign({}, state, { categoriesRequestInProcess: true });

        case ActionTypes.RECEIVE_CATEGORIES:
            return Object.assign({}, state, {
                categoriesRequestInProcess: false,
                categories: action.categories
            });

        case ActionTypes.SELECT_FILTER:
            return Object.assign({}, state, { selectedFilter: action.selectedFilter });

        default:
            return state;
    }
};
