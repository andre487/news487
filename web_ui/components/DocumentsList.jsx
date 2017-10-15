import React, {Component} from 'react';
import moment from 'moment-timezone';

import config from '../config';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';

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
        marginRight: '8px'
    }
};

class DocumentsList extends Component {
    render() {
        const requestInProcess = this.props.requestInProgress;

        return requestInProcess ?
            this._renderProgress() :
            this._renderDocs();
    }

    _renderProgress() {
        return (
            <div style={styles.progress}>
                <CircularProgress size={80} thickness={7} />
            </div>
        );
    }

    _renderDocs() {
        const docs = this.props.items || [];

        return (
            <div>
                {docs.map((doc, idx) => {
                    const tags = (doc.tags || '').split(',');
                    const date = moment.tz(doc.published, 'UTC').tz(config.tz).format('LLL');

                    return (
                        <Paper key={idx} zDepth={1} style={styles.paper}>
                            <Card initiallyExpanded={true}>
                                <CardHeader
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    title={<a href={doc.link} target="_blank">{doc.title}</a>}
                                    subtitle={[
                                        <span key="source_title" style={styles.sourceTitle}>
                                            {doc.source_title}
                                        </span>,
                                        <span key="published">
                                            {date}
                                        </span>
                                    ]} />
                                <CardText
                                    expandable={true}
                                    style={styles.cardText}
                                    dangerouslySetInnerHTML={{ __html: doc.description }} />
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

export default DocumentsList;
