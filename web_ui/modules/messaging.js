import firebase from 'firebase/app';
import 'firebase/messaging';
import config from '../config';

firebase.initializeApp(config.firebase);

const messaging = firebase.messaging();

setupMessaging().catch(err => {
    console.warn('Unable to setup notifications:', err);
});

function setupMessaging() {
    return messaging.requestPermission()
        .then(() => messaging.getToken())
        .then(sendTokenToServer)
        .then(() => messaging.onTokenRefresh(sendTokenToServer));
}

function sendTokenToServer(token) {
    if (!token) {
        return console.warn('Empty messaging token!');
    }

    console.info('Token:', token);
}
