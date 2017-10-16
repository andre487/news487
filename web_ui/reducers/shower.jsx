import * as ActionTypes from '../constants/ActionTypes';
import {writeToStorage, readFromStorage} from '../src/persist';

const expandedStorageKey = 'shower:expandedState';

const initialState = {
    docsRequestInProcess: true,
    docs: [],
    error: null,
    expandedState: readFromStorage(expandedStorageKey, {})
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

        case ActionTypes.CHANGE_CARD_EXPAND:
            const nextState = {
                ...state,
                expandedState: {
                    ...state.expandedState,
                    [action.docId]: action.cardState
                }
            };

            writeToStorage(expandedStorageKey, nextState.expandedState);

            return nextState;

        default:
            return state;
    }
}
