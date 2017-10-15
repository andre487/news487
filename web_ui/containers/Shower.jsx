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
        margin: '15px',
        maxWidth: '800px',
        overflow: 'hidden'
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
        this._routePath = this.props.routePath;
        this._routeParams = this.props.routeParams;

        this._fetchDocuments();
    }

    componentWillUpdate(newProps) {
        if (newProps.routePath !== this._routePath) {
            this._routePath = newProps.routePath;
            this._routeParams = newProps.routeParams;

            this._fetchDocuments();
        }
    }

    render() {
        const docsRequestInProcess = this.props.shower.docsRequestInProcess;

        return docsRequestInProcess ?
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

    _fetchDocuments() {
        this.props.actions.fetchDocs(this._routePath, this._routeParams);
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
