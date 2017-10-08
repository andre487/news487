import config from '../config';
import * as types from '../constants/ActionTypes';

export function fetchDocs(selectedFilter) {
    return (dispatch, getState) => {
        const state = getState();

        if (state.docsRequestInProcess) {
            return;
        }

        dispatch(requestDocs);
        return fetch(buildUrl(selectedFilter))
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

function buildUrl(selectedFilter) {
    if (selectedFilter.startsWith('category:')) {
        const matches = /^category:(.*)$/.exec(selectedFilter);
        const category = matches[1];

        return `${config.apiUrl}/get-documents-by-category?name=${category}&limit=${config.defaultDocsLimit}`;
    }

    return `${config.apiUrl}/get-digest?limit=${config.defaultDocsLimit}`;
}
