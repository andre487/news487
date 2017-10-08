import config from '../config';
import * as types from '../constants/ActionTypes';

export function fetchDocs() {
    return (dispatch, getState) => {
        const state = getState();

        if (state.docsRequestInProcess) {
            return;
        }

        dispatch(requestDocs);
        return fetch(`${config.apiUrl}/get-digest?limit=${config.defaultDocsLimit}`)
            .then(response => response.json())
            .then(docs => dispatch(receiveDocs(docs)));
    };

}

export function requestDocs() {
    return { type: types.REQUEST_DOCS };
}

export function receiveDocs(docs) {
    return {
        type: types.RECEIVE_DOCS,
        docs
    };
}
