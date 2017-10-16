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
            .then(docs => dispatch(receiveDocs(docs)))
            .catch(err => dispatch(receiveDocsError(err)));
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

export function receiveDocsError(err) {
    return {
        type: ActionTypes.RECEIVE_DOCS_ERROR,
        err
    };
}

export function eraseError() {
    return { type: ActionTypes.ERASE_ERROR };
}

function buildUrl(viewType, routePath, routeParams) {
    const noTags = config.excludeTags.join(',');

    if (viewType === ViewTypes.TEXT_SEARCH) {
        return [
            `${config.apiUrl}`,
            `/get-documents`,
            `?text=${encodeURIComponent(routeParams.text)}`,
            `&no-tags=${noTags}`
        ].join('');
    }

    if (viewType === ViewTypes.TAG_SEARCH) {
        return [
            `${config.apiUrl}`,
            `/get-documents`,
            `?tags=${encodeURIComponent(routeParams.tag)}`,
            `&no-tags=${noTags}`,
            `&limit=${config.defaultDocsLimit}`
        ].join('');
    }

    if (viewType === ViewTypes.CATEGORY) {
        if (routePath.startsWith('/category/')) {
            return [
                `${config.apiUrl}`,
                `/get-documents-by-category`,
                `?name=${routeParams.name}`,
                `&limit=${config.defaultDocsLimit}`
            ].join('');
        }

        return [
            `${config.apiUrl}`,
            `/get-digest?limit=${config.defaultDocsLimit}`
        ].join('');
    }

    throw new Error(`Unknown viewType: ${viewType}`);
}
