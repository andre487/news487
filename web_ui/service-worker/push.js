import firebase from 'firebase/app';
import 'firebase/messaging';
import config from '../config';

firebase.initializeApp(config.firebase);

firebase.messaging().setBackgroundMessageHandler(payload => {
    if (!payload.notification) {
        return;
    }

    return self.registration
        .showNotification(payload.notification.title, payload.notification);
});
