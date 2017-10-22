import firebase from 'firebase/app';
import 'firebase/messaging';
import config from '../config';

firebase.initializeApp(config.firebase);

firebase.messaging().setBackgroundMessageHandler(payload => {
    return self.registration
        .showNotification(payload.notification.title, payload.notification);
});
