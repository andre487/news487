import * as ActionTypes from '../constants/ActionTypes';

export function dispatchError(message) {
    return {
        type: ActionTypes.DISPATCH_CLIENT_ERROR,
        message
    };
}

export function eraseErrors(message) {
    return {
        type: ActionTypes.ERASE_CLIENT_ERRORS,
        message
    };
}
