import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Provider} from 'react-redux';

import App from '../containers/App';
import configureStore from '../store/configureStore';

window.stopPageLoadingRotation();
injectTapEventPlugin();

ReactDOM.render(
    <Provider store={configureStore()}>
        <App />
    </Provider>,
    document.getElementById('root')
);
