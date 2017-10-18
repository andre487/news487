export default {
    apiUrl: process.env.API_URL,
    defaultDocsLimit: 30,
    fields: ['id', 'title', 'link', 'published', 'description', 'tags', 'source_title'],

    excludeTags: ['twitter'],
    hideTags: ['from_mail', 'composite', 'no_tech']
};
