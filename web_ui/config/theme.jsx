import {fade} from 'material-ui/utils/colorManipulator'
import * as Colors from 'material-ui/styles/colors';
import {spacing, getMuiTheme} from 'material-ui/styles';

const fontFamily = 'Roboto, sans-serif';

const rawBaseTheme = {
    ...spacing,
    fontFamily: fontFamily,
    palette: {
        primary1Color: Colors.cyan500,
        primary2Color: Colors.cyan700,
        primary3Color: Colors.lightBlack,
        accent1Color: Colors.pinkA200,
        accent2Color: Colors.grey100,
        accent3Color: Colors.grey500,
        textColor: Colors.darkBlack,
        alternateTextColor: Colors.white,
        canvasColor: Colors.white,
        borderColor: Colors.grey300,
        disabledColor: fade(Colors.darkBlack, 0.3)
    },
    customStyle: {
        lightHintColor: Colors.lightWhite,
        lightInputColor: Colors.darkWhite
    },
    globalStyle: {
        html: {
            'font-family': fontFamily,
            'overflow-y': 'scroll'
        },
        body: {
            'font-size': '15px',
            'line-height': '20px',
            margin: 0
        },
        'a:link': {
            color: Colors.blue500
        },
        'a:visited': {
            color: Colors.deepPurple500
        },
        'a:hover': {
            color: Colors.red400
        },
        hr: {
            border: 'none',
            'border-top': `1px solid ${Colors.minBlack}`
        },
        '.document-card img': {
            'max-width': '100%'
        },
        '.document-card pre, .document-card code': {
            'max-width': '100%',
            'overflow-x': 'auto'
        }
    }
};

//Theme must be wrapped in function getMuiTheme
export default getMuiTheme(rawBaseTheme);
