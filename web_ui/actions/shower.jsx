import config from '../config';
import * as types from '../constants/ActionTypes';

export function fetchDocs(routePath, routeParams) {
    return (dispatch, getState) => {
        const state = getState();

        if (state.docsRequestInProcess) {
            return;
        }

        dispatch(requestDocs);
        return fetch(buildUrl(routePath, routeParams))
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

function buildUrl(routePath, routeParams) {
    if (routePath.startsWith('/category/')) {
        return `${config.apiUrl}/get-documents-by-category?name=${routeParams.name}&limit=${config.defaultDocsLimit}`;
    }

    return `${config.apiUrl}/get-digest?limit=${config.defaultDocsLimit}`;
}
