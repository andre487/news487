import {fade} from 'material-ui/utils/colorManipulator'
import * as Colors from 'material-ui/styles/colors';
import {getMuiTheme, spacing} from 'material-ui/styles';

const darkTheme = {
    ...spacing,
    fontFamily: 'Roboto, sans-serif',
    borderRadius: 2,
    palette: {
        primary1Color: Colors.blueGrey300,
        primary2Color: Colors.blueGrey300,
        primary3Color: Colors.grey700,
        accent1Color: Colors.pinkA200,
        accent2Color: Colors.pinkA400,
        accent3Color: Colors.pinkA100,
        textColor: fade(Colors.fullWhite, 0.7),
        secondaryTextColor: fade(Colors.fullWhite, 0.65),
        alternateTextColor: '#303030',
        canvasColor: '#303030',
        borderColor: fade(Colors.fullWhite, 0.3),
        disabledColor: fade(Colors.fullWhite, 0.3),
        pickerHeaderColor: fade(Colors.fullWhite, 0.12),
        clockCircleColor: fade(Colors.fullWhite, 0.12)
    },
    customStyle: {
        lightHintColor: Colors.grey300,
        lightInputColor: Colors.grey200
    },
    globalStyle: {
        html: {
            'overflow-y': 'scroll'
        },
        body: {
            margin: 0,
            background: Colors.grey600
        },
        'a:link': {
            color: Colors.blueGrey300
        },
        'a:visited': {
            color: Colors.grey400
        },
        'a:hover': {
            color: Colors.red400
        },
        hr: {
            border: 'none',
            'border-top': `1px solid ${Colors.lightWhite}`
        },
        '.document-card img': {
            'max-width': '100%'
        },
        '.document-card p': {
            margin: 0
        },
        '.document-card p + p': {
            'margin-top': '1em'
        },
        '.document-card p + hr': {
            'margin-top': '0.6em'
        },
        '.document-card hr + p': {
            'margin-top': '0.6em'
        },
        '.document-card pre, .document-card code': {
            'max-width': '100%',
            'overflow-x': 'auto'
        }
    },
    appBar: {
        textColor: Colors.grey300
    }
};

//Theme must be wrapped in function getMuiTheme
export default getMuiTheme(darkTheme);
