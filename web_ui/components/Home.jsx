import React, {PureComponent} from 'react';

class Home extends PureComponent {
    componentWillMount() {
        const { lastRouteData} = this.props;

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
