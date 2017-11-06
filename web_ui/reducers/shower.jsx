import * as ActionTypes from '../constants/ActionTypes';
import {writeToStorage, readFromStorage} from '../src/persist';

const expandedStorageKey = 'shower:expandedState';

const initialState = {
    docsRequestInProcess: true,
    docs: [],
    error: null,
    page: 0,
    expandedState: readFromStorage(expandedStorageKey, {})
};

export default function shower(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.SHOW_PREV:
        case ActionTypes.SHOW_NEXT: {
            return {
                ...state,
                page: action.page,
            };
        }

        case ActionTypes.REQUEST_DOCS: {
            return {
                ...state,
                docsRequestInProcess: true,
                error: null
            };
        }

        case ActionTypes.RECEIVE_DOCS: {
            return {
                ...state,
                docsRequestInProcess: false,
                docs: action.docs,
                error: null
            };
        }

        case ActionTypes.RECEIVE_DOCS_ERROR: {
            return {
                ...state,
                error: null
            };
        }

        case ActionTypes.ERASE_ERROR: {
            return {
                ...state,
                error: null
            };
        }

        case ActionTypes.CHANGE_CARD_EXPAND: {
            const nextState = {
                ...state,
                expandedState: {
                    ...state.expandedState,
                    [action.docId]: action.cardState
                }
            };

            writeToStorage(expandedStorageKey, nextState.expandedState);

            return nextState;
        }

        case ActionTypes.SHOW_VIDEO: {
            return {
                ...state,
                showVideoData: action.videoData
            };
        }

        case ActionTypes.HIDE_VIDEO: {
            const newState = { ...state };

            delete newState.showVideoData;

            return newState;
        }

        default: {
            return state;
        }
    }
}
