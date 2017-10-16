import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';

import theme from '../config/theme';
import * as ViewTypes from '../constants/ViewTypes';

const styles = {
    textSearch: {
        flex: '1 1 0%',
        width: '160px',
        lineHeight: '16px',
        marginTop: '9px'
    },
    textSearchHint: {
        color: theme.customStyle.lightHintColor
    },
    textInput: {
        color: theme.customStyle.lightInputColor
    }
};

class Header extends Component {
    componentDidMount() {
        this._searchText = '';
    }

    render() {
        const title = this.props.filterTitle || 'News';
        const viewType = this.props.viewType;

        const defaultValue = viewType === ViewTypes.TEXT_SEARCH && this.props.searchText || '';

        // noinspection HtmlUnknownTarget
        const searchForm = (
            <form action="/search" onSubmit={this._onTextSearch.bind(this)}>
                <TextField
                    style={styles.textSearch}
                    hintStyle={styles.textSearchHint}
                    inputStyle={styles.textInput}

                    onChange={this._onSearchInputChange.bind(this)}

                    name="text"
                    defaultValue={defaultValue}
                    hintText="Search text" />
            </form>
        );

        return (
            <AppBar
                title={title}
                onLeftIconButtonTouchTap={this.props.onMenuButtonTap}>
                {searchForm}
            </AppBar>
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

export default Header;

