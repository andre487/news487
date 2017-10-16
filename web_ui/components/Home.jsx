import React, {Component} from 'react';
import {rememberRoute} from '../src/persist';

class Home extends Component {
    componentWillMount() {
        const lastRouteData = rememberRoute();

        let defaultRoute;
        if (lastRouteData && lastRouteData.routePath !== '/') {
            defaultRoute = lastRouteData.routePath;
        } else {
            defaultRoute = '/digest';
        }

        this.props.history.replace(defaultRoute);
    }

    render() {
        return (null);
    }
}

export default Home;
