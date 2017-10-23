import firebase from 'firebase/app';
import 'firebase/messaging';
import config from '../config';

firebase.initializeApp(config.firebase);

const messaging = firebase.messaging();

messaging.onMessage(payload => {
    if (!payload.notification) {
        return;
    }

    const permission = Notification.permission;
    if (permission === 'granted') {
        new Notification(payload.notification.title, payload.notification);
    } else {
        console.warn(`Notification permission is ${permission}`);
    }
});

setupMessaging().catch(err => {
    console.warn('Unable to setup notifications:', err);
});

function setupMessaging() {
    return messaging.requestPermission()
        .then(() => messaging.getToken())
        .then(sendTokenToServer)
        .then(() => messaging.onTokenRefresh(refreshTokenOnServer));
}

function sendTokenToServer(token) {
    if (!token) {
        return console.warn('Empty messaging token!');
    }

    if (tokenHasAlreadySent()) {
        return;
    }

    const fetchInit = {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        body: token,
    };
    return fetch(`${process.env.PUSHER_URL}/add-token`, fetchInit)
        .then(res => res.json())
        .then(res => res.success || Promise.reject(new Error(res.result)))
        .then(rememberTokenHasSent);
}

function refreshTokenOnServer(token) {
    resetTokenHasSent();
    return sendTokenToServer(token);
}

function tokenHasAlreadySent() {
    try {
        return localStorage.getItem('news487:messaging-token:sent');
    } catch (e) {}
}

function rememberTokenHasSent() {
    try {
        localStorage.setItem('news487:messaging-token:sent', 1);
    } catch (e) {}
}

function resetTokenHasSent() {
    try {
        localStorage.removeItem('news487:messaging-token:sent');
    } catch (e) {}
}
