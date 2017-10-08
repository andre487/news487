import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import Paper from 'material-ui/Paper';

import * as ShowerActions from '../actions/shower';

const styles = {
    progress: {
        marginTop: 40,
        textAlign: 'center'
    },
    paper: {
        margin: '10px',
        maxWidth: '800px'
    },
    cardText: {
        padding: '0 16px'
    },
    sourceTitle: {
        marginRight: '10px'
    }
};

class Shower extends Component {
    componentDidMount() {
        this.props.actions.fetchDocs();
    }

    render() {
        return this.props.shower.docsRequestInProcess ?
            this._createProgress() :
            this._createDocsList();
    }

    _createProgress() {
        return (
            <div style={styles.progress}>
                <CircularProgress size={80} thickness={7} />
            </div>
        );
    }

    _createDocsList() {
        const { docs } = this.props.shower;

        return (
            <div>
                {docs.map((doc, idx) => {
                    const tags = (doc.tags || '').split(',');

                    return (
                        <Paper key={idx} zDepth={1} style={styles.paper}>
                            <Card>
                                <CardHeader
                                    title={<a href={doc.link} target="_blank">{doc.title}</a>}
                                    subtitle={[
                                        <span key="source_title" style={styles.sourceTitle}>
                                            {doc.source_title}
                                        </span>,
                                        <span key="published">
                                            {doc.published}
                                        </span>
                                    ]} />
                                <CardText
                                    dangerouslySetInnerHTML={{ __html: doc.description }}
                                    style={styles.cardText} />
                                <CardActions>
                                    {tags.map((tag, idx) => {
                                        return <FlatButton key={idx} label={tag} />
                                    })}
                                </CardActions>
                            </Card>
                        </Paper>
                    );
                })}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { shower: state.shower };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ShowerActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Shower);
