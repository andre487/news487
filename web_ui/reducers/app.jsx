import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
    menuOpened: null
};

export default function app(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.TOGGLE_MENU:
            return Object.assign({}, state, { menuOpened: !state.menuOpened });
        default:
            return state;
    }
}
