import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
    readingInProcess: false,
    readingStopInProcess: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.READING_STARTED:
        case ActionTypes.READING_FINISHED: {
            return {
                ...state,
                readingInProcess: action.readingInProcess,
                readingStopInProcess: false,
            };
        }

        case ActionTypes.STOP_READING: {
            return {
                ...state,
                readingStopInProcess: action.readingStopInProcess,
            };
        }

        default: {
            return state;
        }
    }
};
