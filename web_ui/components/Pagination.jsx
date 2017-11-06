import React, {PureComponent} from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
    container: {
        display: 'flex',
        margin: '25px 0',

        alignItems: 'center',
        justifyContent: 'center',
    },
    prevButton: {
        marginRight: '10px'
    },
    currentPage: {
        marginRight: '10px',
    }
};

export default class PaginationButton extends PureComponent {
    render() {
        const { page } = this.props;
        return (
            <div style={styles.container}>
                <RaisedButton
                    label={page > 0 ? `← ${page}` : '←'}
                    primary={true}
                    disabled={this.props.disabled || page < 1}
                    style={styles.prevButton}
                    onClick={this.props.onPreviousClick} />
                <RaisedButton
                    label={page + 1}
                    primary={false}
                    disabled={true}
                    style={styles.currentPage} />
                <RaisedButton
                    label={`${page + 2} →`}
                    primary={true}
                    disabled={this.props.disabled}
                    onClick={this.props.onNextClick} />
            </div>
        );
    }
};
