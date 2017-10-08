import {combineReducers} from 'redux';

import app from './app';
import shower from './shower';

export default combineReducers({
    app,
    shower
});
