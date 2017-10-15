import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';

import {ConnectedRouter, routerMiddleware, routerReducer} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import {Route} from 'react-router';

import reducers from '../reducers';
import Home from '../components/Home';
import App from '../containers/App';

window.stopPageLoadingRotation();
injectTapEventPlugin();

const loggerMiddleware = createLogger();
const history = createHistory();

const store = createStore(
    combineReducers({
        ...reducers,
        router: routerReducer
    }),
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware,
        routerMiddleware(history)
    )
);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <div>
                <Route path="/" exact={true} component={Home} />
                <Route path="/digest" exact={true} component={App} />
                <Route path="/category/:name" exact={true} component={App} />
                <Route path="/search/:text" exact={true} component={App} />
                <Route path="/tag/:tag" exact={true} component={App} />
            </div>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);
