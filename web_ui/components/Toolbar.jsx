import React, {PureComponent} from 'react';

import TextField from 'material-ui/TextField';
import TextReader from '../containers/TextReader';

import * as ViewTypes from '../constants/ViewTypes';
import theme from '../config/theme';

const styles = {
    container: {
        display: 'flex',
        alignContent: 'flex-start',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexShrink: '1 20',
        margin: '8px 0 0',
        padding: '5px 8px',
        background: theme.customStyle.bgColor,
    },
    searchForm: {
        overflow: 'hidden',
        marginLeft: '8px',
    }
};

class Toolbar extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onTextSearch = this._onTextSearch.bind(this);
        this._onSearchInputChange = this._onSearchInputChange.bind(this);
    }

    componentDidMount() {
        this._searchText = '';
    }

    render() {
        const viewType = this.props.viewType;

        const defaultValue = viewType === ViewTypes.TEXT_SEARCH && this.props.searchText || '';

        // noinspection HtmlUnknownTarget
        return (
            <div style={styles.container}>
                <TextReader />

                <form action="/search" style={styles.searchForm} onSubmit={this._onTextSearch}>
                    <TextField
                        style={styles.textSearch}
                        hintStyle={styles.textSearchHint}
                        inputStyle={styles.textInput}

                        onChange={this._onSearchInputChange}

                        name="text"
                        defaultValue={defaultValue}
                        hintText="Search text" />
                </form>
            </div>
        );
    }

    _onSearchInputChange(e, text) {
        this._searchText = text;
    }

    _onTextSearch(e) {
        let text = this._searchText || '';
        text = text.trim();

        if (text) {
            this.props.onTextSearch(text);
        }

        e.preventDefault();
    }
}

export default Toolbar;
