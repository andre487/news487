import {fade} from 'material-ui/utils/colorManipulator'
import * as Colors from 'material-ui/styles/colors';
import {getMuiTheme, spacing} from 'material-ui/styles';

import './theme.css';

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
    appBar: {
        textColor: Colors.grey300
    }
};

//Theme must be wrapped in function getMuiTheme
export default getMuiTheme(darkTheme);
