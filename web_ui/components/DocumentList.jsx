import React, {PureComponent} from 'react';
import {DateTime} from 'luxon';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';

import Document from './Document';

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
        fontSize: '18px',
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

const expandedThreshold = 3000;

class DocumentsList extends PureComponent {
    render() {
        const requestInProcess = this.props.requestInProgress;

        this._expandedState = this.props.expandedState;

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
        let expanded = this._expandedState[doc.id];
        if (expanded === undefined) {
            expanded = doc.description.length < expandedThreshold;
        }

        const isTwitter = doc.tags.includes('twitter');

        return (
            <Paper key={doc.id} zDepth={1} style={styles.paper}>
                <Card
                    initiallyExpanded={expanded}
                    onExpandChange={this._onCardExpandChange.bind(this, doc.id)}>
                    <CardHeader
                        titleStyle={styles.cardTitle}
                        subtitleStyle={styles.cardSubtitle}
                        showExpandableButton={true}
                        title={
                            <a href={doc.link}
                               target="_blank"
                               rel="noopener"
                               dangerouslySetInnerHTML={{ __html: doc.title }} />
                        }
                        subtitle={`${doc.source_title} – ${this._renderDate(doc)}`} />
                    <CardText
                        expandable={true}
                        style={styles.cardText}>
                        <Document
                            cardType={doc.card_type}
                            isTwitter={isTwitter}
                            title={doc.title}
                            link={doc.link}
                            picture={doc.picture}
                            description={doc.description} />
                    </CardText>
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
        const tags = doc.tags.filter(tag => !config.hideTags.includes(tag));

        return tags.map(tag => {
            return (
                <FlatButton
                    key={tag}
                    label={tag}
                    onClick={this._onSelectTag.bind(this, tag)} />
            );
        });
    }

    _onCardExpandChange(docId, state) {
        this.props.onCardExpandChange(docId, state);
    }

    _onSelectTag(tag) {
        this.props.onTagSelected(tag);
    }
}

export default DocumentsList;
