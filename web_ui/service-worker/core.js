export const ORIGIN_CACHE = `origin:${process.env.GIT_HASH}`;
export const API_CACHE = `api:${process.env.GIT_HASH}`;
export const FONTS_CACHE = `fonts:${process.env.GIT_HASH}`;

export const T_ORIGIN = 'origin';
export const T_DOCS_API = 'api';
export const T_FONT = 'font';

export const SR_NET_FIRST = 'strategy-net-first';
export const SR_CACHE_FIRST = 'strategy-cache-first';

export const HANDLER_PATTERNS = [/\/digest/, /\/category\/.+/, /\/tag\/.+/];
export const HANDLER_CANONICAL = `${self.location.origin}/index.html`;

export function onInstall(event) {
    event.waitUntil(self.skipWaiting());
}

export function onActivate(event) {
    const done = caches.keys()
        .then(cacheVersions => {
            return Promise.all(cacheVersions.map(version => {
                if (version !== ORIGIN_CACHE && version !== API_CACHE && version !== FONTS_CACHE) {
                    return caches.delete(version);
                }
            }));
        })
        .then(() => self.clients.claim());

    event.waitUntil(done);
}

self.addEventListener('message', event => {
    const { data } = event;

    if (data.type !== 'assets') {
        return;
    }

    const assets = Object.entries(data.payload)
        .map(([,data]) => data)
        .filter(item => !item.entry.endsWith('sw.js'));

    const entries = assets.map(({ entry }) => entry);

    const done = Promise
        .all(assets.map(({ entry, hash }) => fetch(`/${entry}?${hash}`)))
        .then(responses => {
            return caches.open(ORIGIN_CACHE).then(cache => Promise.all(
                responses.map((response, idx) => cache.put(entries[idx], response))
            ));
        });

    event.waitUntil(done);
});
