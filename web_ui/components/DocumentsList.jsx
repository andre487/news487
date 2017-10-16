import React, {Component} from 'react';
import {DateTime} from 'luxon';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';

import config from '../config';

const styles = {
    progress: {
        marginTop: 40,
        textAlign: 'center'
    },
    paper: {
        margin: '8px',
        maxWidth: '900px',
        overflow: 'hidden'
    },
    cardTitle: {
        fontSize: '17px',
    },
    cardSubtitle: {
        fontSize: '15px',
        marginTop: '10px'
    },
    cardText: {
        fontSize: '16px',
        padding: '0 16px',
        lineHeight: '1.5'
    },
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
                {docs.map(this._renderDoc, this)}
            </div>
        );
    }

    _renderDoc(doc) {
        return (
            <Paper key={doc.id} zDepth={1} style={styles.paper}>
                <Card initiallyExpanded={true} className="document-card">
                    <CardHeader
                        titleStyle={styles.cardTitle}
                        subtitleStyle={styles.cardSubtitle}
                        actAsExpander={true}
                        showExpandableButton={true}
                        title={
                            <a href={doc.link}
                               target="_blank"
                               dangerouslySetInnerHTML={{ __html: doc.title }} />
                        }
                        subtitle={`${doc.source_title} – ${this._renderDate(doc)}`} />
                    <CardText
                        expandable={true}
                        style={styles.cardText}
                        dangerouslySetInnerHTML={{ __html: doc.description }} />
                    <CardActions>
                        {this._renderTagsLine(doc)}
                    </CardActions>
                </Card>
            </Paper>
        );
    }

    _renderDate(doc) {
        return DateTime.fromISO(doc.published, { zone: 'UTC' })
            .setZone()
            .toLocaleString(DateTime.DATETIME_MED);
    }

    _renderTagsLine(doc) {
        const tags = (doc.tags || '')
            .split(',')
            .filter(tag => !config.hideTags.includes(tag));

        return tags.map((tag, idx) => {
            return (
                <FlatButton
                    key={idx}
                    label={tag}
                    onClick={this._onSelectTag.bind(this, tag)} />
            );
        });
    }

    _onSelectTag(tag) {
        this.props.onTagSelected(tag);
    }
}

export default DocumentsList;
