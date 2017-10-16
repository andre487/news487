import React, {PureComponent} from 'react';

class NotFound extends PureComponent {
    render() {
        return (
            <div>
                <p>Page not found 💩</p>
                <p>Try to go to the <a href="/">main page</a></p>
            </div>
        );
    }
}

export default NotFound;
