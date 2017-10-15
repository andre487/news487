import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
    docsRequestInProcess: true,
    docs: []
};

export default function shower(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.REQUEST_DOCS:
            return {
                ...state,
                docsRequestInProcess: true
            };

        case ActionTypes.RECEIVE_DOCS:
            return {
                ...state,
                docsRequestInProcess: false,
                docs: action.docs
            };

        default:
            return state;
    }
};
