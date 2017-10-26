import * as speech from '../speech';

import * as ActionTypes from '../constants/ActionTypes';

export function readAllNews() {
    return dispatch => {
        dispatch(readingStarted());

        const onFinish = () => {
            dispatch(readingFinished());
        };

        speech.readAllNews().then(onFinish, onFinish);
    };
}

export function stopReading() {
    speech.stopReading();

    return {
        type: ActionTypes.STOP_READING,
        readingStopInProcess: true,
    };
}

export function readingStarted() {
    return {
        type: ActionTypes.READING_STARTED,
        readingInProcess: true,
    };
}

export function readingFinished() {
    return {
        type: ActionTypes.READING_FINISHED,
        readingInProcess: false,
    };
}
