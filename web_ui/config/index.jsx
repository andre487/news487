export default {
    apiUrl: process.env.API_URL,
    defaultDocsLimit: 30,
    fields: [
        'id', 'card_type', 'title', 'link', 'published', 'description',
        'tags', 'source_title', 'picture', 'video',
    ],

    excludeTags: ['twitter'],
    hideTags: ['from_mail', 'composite', 'no_tech'],

    firebase: {
        apiKey: 'AIzaSyBuqkpAmGrVFB6NlojlPuSyOq3_L5ZnG6E',
        authDomain: 'news-487.firebaseapp.com',
        databaseURL: 'https://news-487.firebaseio.com',
        projectId: 'news-487',
        storageBucket: 'news-487.appspot.com',
        messagingSenderId: '634669586377'
    }
};
