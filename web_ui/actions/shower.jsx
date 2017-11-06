import config from '../config';
import * as ActionTypes from '../constants/ActionTypes';
import * as ViewTypes from '../constants/ViewTypes';

export function fetchDocs(viewType, searchText, page) {
    return dispatch => {
        const offset = page * config.defaultDocsLimit;

        dispatch(requestDocs());
        return fetch(buildUrl(viewType, searchText, config.defaultDocsLimit, offset))
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

export function goToPrevPage() {
    return (dispatch, getState) => {
        const state = getState();
        const { page } = state.shower;

        dispatch({
            type: ActionTypes.SHOW_PREV,
            page: page > 0 ? page - 1 : page,
        });
    };
}

export function goToNextPage() {
    return (dispatch, getState) => {
        const state = getState();
        const { page } = state.shower;

        dispatch({
            type: ActionTypes.SHOW_NEXT,
            page: page + 1,
        });
    };
}

export function changeCardExpand(docId, cardState) {
    return {
        type: ActionTypes.CHANGE_CARD_EXPAND,
        docId,
        cardState
    };
}

export function showVideo(videoData) {
    return {
        type: ActionTypes.SHOW_VIDEO,
        videoData
    };
}

export function hideVideo() {
    return { type: ActionTypes.HIDE_VIDEO };
}

function buildUrl(viewType, searchText, limit, offset) {
    const noTags = config.excludeTags.join(',');
    let url;

    switch (viewType) {
        case ViewTypes.TEXT_SEARCH:
            url = [
                `${config.apiUrl}`,
                `/get-documents`,
                `?text=${encodeURIComponent(searchText)}`,
                `&no-tags=${noTags}`
            ].join('');
            break;
        case ViewTypes.TAG_SEARCH:
            url = [
                `${config.apiUrl}`,
                `/get-documents`,
                `?tags=${encodeURIComponent(searchText)}`,
                `&no-tags=${noTags}`,
                `&limit=${limit}&offset=${offset}`
            ].join('');
            break;
        case ViewTypes.CATEGORY:
            if (searchText) {
                url = [
                    `${config.apiUrl}`,
                    `/get-documents-by-category`,
                    `?name=${searchText}`,
                    `&limit=${limit}&offset=${offset}`
                ].join('');
            } else {
                url = [
                    `${config.apiUrl}`,
                    `/get-digest?limit=${limit}&offset=${offset}`
                ].join('');
            }
            break;
        default:
            throw new Error(`Unknown viewType: ${viewType}`);
    }

    url += `&fields=${config.fields.join(',')}`;

    return url;
}
