import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';

import {ConnectedRouter, routerMiddleware, routerReducer} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import {Route, Switch} from 'react-router';

import reducers from '../reducers';
import Home from '../components/Home';
import App from '../containers/App';
import NotFound from '../components/NotFound';

import persist, {rememberRoute} from './persist';
import '../modules/messaging';

window.stopPageLoadingRotation();
injectTapEventPlugin();

const history = createHistory();

let middleware;
if (process.env.NODE_ENV === 'production') {
    middleware = applyMiddleware(
        thunkMiddleware,
        routerMiddleware(history)
    );
} else {
    const createLogger = require('redux-logger').createLogger;

    middleware = applyMiddleware(
        thunkMiddleware,
        createLogger(),
        routerMiddleware(history)
    );
}

const store = createStore(
    combineReducers({
        ...reducers,
        router: routerReducer
    }),
    middleware
);

persist(store);

const lastRouteData = rememberRoute();

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Switch>
                <Route path="/" exact={true} lastRouteData={lastRouteData} component={Home} />
                <Route path="/digest" exact={true} component={App} />
                <Route path="/category/:name" exact={true} component={App} />
                <Route path="/search/:text" exact={true} component={App} />
                <Route path="/tag/:tag" exact={true} component={App} />
                <Route component={NotFound} />
            </Switch>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);
