// noinspection SpellCheckingInspection
export default {
    apiUrl: process.env.API_URL,
    defaultDocsLimit: 30,
    fields: [
        'id', 'card_type', 'title', 'link', 'published', 'description',
        'tags', 'source_title', 'picture', 'video',
    ],

    excludeTags: ['twitter'],
    hideTags: ['from_mail', 'no_tech'],

    firebase: {
        apiKey: 'AIzaSyBuqkpAmGrVFB6NlojlPuSyOq3_L5ZnG6E',
        authDomain: 'news-487.firebaseapp.com',
        databaseURL: 'https://news-487.firebaseio.com',
        projectId: 'news-487',
        storageBucket: 'news-487.appspot.com',
        messagingSenderId: '634669586377'
    },

    speechKitKey: '1cd3775d-03e1-42d9-bf4f-64cfbf8a375a',
    speechParams: {
        emotions: [['good', 0.5], ['neutral', 0.35], ['evil', 0.15]],
        speaker: 'ermil',
        fast: true,
    }
};
