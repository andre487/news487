import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';

import theme from '../config/theme';

const styles = {
    textSearch: {
        flex: '1 1 0%',
        lineHeight: '16px',
        marginTop: '8px'
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
        const hintText = this.props.searchText || 'Search text';

        // noinspection HtmlUnknownTarget
        const searchForm = (
            <form action="/search" onSubmit={this._onTextSearch.bind(this)}>
                <TextField
                    style={styles.textSearch}
                    hintStyle={styles.textSearchHint}
                    inputStyle={styles.textInput}

                    onChange={this._onSearchInputChange.bind(this)}

                    name="text"
                    hintText={hintText} />
            </form>
        );

        return (
            <AppBar
                title={title}
                onLeftIconButtonTouchTap={this.props.onMenuButtonTap}
                children={searchForm} />
        );
    }

    _onSearchInputChange(e, text) {
        this._searchText = text;
    }

    _onTextSearch(e) {
        this.props.onTextSearch(this._searchText);

        e.preventDefault();
    }
}

export default Header;

