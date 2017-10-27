import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
    currentErrors: {}
};

export default function(state = initialState, action) {
    const message = action.message;

    switch (action.type) {
        case ActionTypes.DISPATCH_CLIENT_ERROR: {
            const currentErrors = { ...state.currentErrors };
            const currentCount = currentErrors[message] || 0;

            currentErrors[message] = currentCount + 1;

            return {
                ...state,
                currentErrors,
            };
        }
        case ActionTypes.ERASE_CLIENT_ERRORS: {
            let currentErrors = {};
            if (message) {
                currentErrors = { ...state.currentErrors };
                delete currentErrors[message];
            }
            return {
                ...state,
                currentErrors,
            };
        }
        default: {
            return state;
        }
    }
};
