import config from '../config';
import * as ActionTypes from '../constants/ActionTypes';
import * as ViewTypes from '../constants/ViewTypes';

export function fetchDocs(viewType, routePath, routeParams) {
    return (dispatch, getState) => {
        const state = getState();

        if (state.docsRequestInProcess) {
            return;
        }

        dispatch(requestDocs());
        return fetch(buildUrl(viewType, routePath, routeParams))
            .then(response => response.json())
            .then(docs => dispatch(receiveDocs(docs)));
    };
}

export function requestDocs() {
    return { type: ActionTypes.REQUEST_DOCS };
}

export function receiveDocs(docs) {
    return {
        type: ActionTypes.RECEIVE_DOCS,
        docs
    };
}

function buildUrl(viewType, routePath, routeParams) {
    if (viewType === ViewTypes.TEXT_SEARCH) {
        return `${config.apiUrl}/get-documents?text=${encodeURIComponent(routeParams.text)}&limit=${config.defaultDocsLimit}`;
    }

    if (routePath.startsWith('/category/')) {
        return `${config.apiUrl}/get-documents-by-category?name=${routeParams.name}&limit=${config.defaultDocsLimit}`;
    }

    return `${config.apiUrl}/get-digest?limit=${config.defaultDocsLimit}`;
}
