import React, {Component} from 'react';

class Home extends Component {
    componentWillMount() {
        this.props.history.replace('/digest');
    }

    render() {
        return (null);
    }
}

export default Home;
