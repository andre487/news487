import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
    docsRequestInProcess: true,
    docs: [],
    error: null
};

export default function shower(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.REQUEST_DOCS:
            return {
                ...state,
                docsRequestInProcess: true,
                error: null
            };

        case ActionTypes.RECEIVE_DOCS:
            return {
                ...state,
                docsRequestInProcess: false,
                docs: action.docs,
                error: null
            };

        case ActionTypes.RECEIVE_DOCS_ERROR:
            return {
                ...state,
                docsRequestInProcess: false,
                error: action.err.toString()
            };

        case ActionTypes.ERASE_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
}
